const {
  createBotVsBotState,
  ensureRowAvailable,
  processBotTurns,
} = require("./server");

function average(value, count) {
  return count === 0 ? 0 : value / count;
}

function createAggregate() {
  return {
    games: 0,
    wins: { player1: 0, player2: 0 },
    turnsTotal: 0,
    turnsMin: Infinity,
    turnsMax: 0,
    starsBySource: { case16: 0, zombie: 0 },
    cardActivations: {},
    cardMovementTotal: {},
    replaysGranted: {},
    caseEntries: { 5: 0, 7: 0 },
    boardFlip: { prompts: 0, used: 0, skipped: 0 },
    discards: {
      columns: 0,
      cards: 0,
      bySource: {},
    },
    rowRefills: 0,
    rowReplacements: 0,
    hiddenCardsPlayedByPlayer: { 0: 0, 1: 0 },
    blockedTurns: 0,
    forcedDiscards: 0,
    winnerChiefs: 0,
    winnerZombies: 0,
  };
}

function mergeCardMap(target, source) {
  Object.entries(source).forEach(([key, value]) => {
    target[key] = (target[key] || 0) + value;
  });
}

function runSingleSimulation(difficultyA, difficultyB, maxLoops = 500) {
  const game = createBotVsBotState(difficultyA, difficultyB);
  let loops = 0;

  while (!game.winner && loops < maxLoops) {
    ensureRowAvailable(game);
    processBotTurns(game);
    ensureRowAvailable(game);
    loops += 1;
  }

  return game;
}

function getWinnerIndex(game) {
  const playerOneStars = game.players[0]?.stars ?? 0;
  const playerTwoStars = game.players[1]?.stars ?? 0;

  if (playerOneStars > playerTwoStars) return 0;
  if (playerTwoStars > playerOneStars) return 1;

  return game.players.findIndex((player) => player.name === game.winner);
}

function buildReport(aggregate) {
  const cardNames = Object.keys(aggregate.cardActivations).sort();
  const cardRows = cardNames.map((name) => {
    const activations = aggregate.cardActivations[name] || 0;
    const totalMove = aggregate.cardMovementTotal[name] || 0;
    const replaysGranted = aggregate.replaysGranted[name] || 0;
    return {
      name,
      activations,
      totalMove,
      replaysGranted,
      averageMove: average(totalMove, activations),
    };
  });

  const strongest = [...cardRows].sort((a, b) => b.averageMove - a.averageMove)[0] || null;
  const weakest = [...cardRows].sort((a, b) => a.averageMove - b.averageMove)[0] || null;

  return {
    overview: {
      games: aggregate.games,
      firstPlayerWinRate: average(aggregate.wins.player1, aggregate.games),
      player1Wins: aggregate.wins.player1,
      player2Wins: aggregate.wins.player2,
      averageTurns: average(aggregate.turnsTotal, aggregate.games),
      minTurns: aggregate.turnsMin === Infinity ? 0 : aggregate.turnsMin,
      maxTurns: aggregate.turnsMax,
    },
    stars: {
      case16: aggregate.starsBySource.case16,
      zombie: aggregate.starsBySource.zombie,
      averageCase16PerGame: average(aggregate.starsBySource.case16, aggregate.games),
      averageZombiePerGame: average(aggregate.starsBySource.zombie, aggregate.games),
    },
    cards: {
      byType: cardRows,
      strongestByAverageMove: strongest,
      weakestByAverageMove: weakest,
    },
    board: {
      case5Entries: aggregate.caseEntries[5],
      case7StopEntries: aggregate.caseEntries[7],
      discardedColumns: aggregate.discards.columns,
      discardedCards: aggregate.discards.cards,
      averageDiscardedColumnsPerGame: average(aggregate.discards.columns, aggregate.games),
      averageDiscardedCardsPerGame: average(aggregate.discards.cards, aggregate.games),
      discardsBySource: aggregate.discards.bySource,
      rowRefillsTotal: aggregate.rowRefills,
      rowNormalRefills: aggregate.rowRefills - aggregate.rowReplacements,
      rowFullReplacements: aggregate.rowReplacements,
      boardFlipPrompts: aggregate.boardFlip.prompts,
      boardFlipUsed: aggregate.boardFlip.used,
      boardFlipSkipped: aggregate.boardFlip.skipped,
    },
    hiddenCards: {
      player1Total: aggregate.hiddenCardsPlayedByPlayer[0],
      player2Total: aggregate.hiddenCardsPlayedByPlayer[1],
      averagePlayer1PerGame: average(aggregate.hiddenCardsPlayedByPlayer[0], aggregate.games),
      averagePlayer2PerGame: average(aggregate.hiddenCardsPlayedByPlayer[1], aggregate.games),
    },
    blocks: {
      blockedTurns: aggregate.blockedTurns,
      forcedDiscards: aggregate.forcedDiscards,
      averageBlockedTurnsPerGame: average(aggregate.blockedTurns, aggregate.games),
    },
    balance: {
      averageChiefsOnWinnerBoard: average(aggregate.winnerChiefs, aggregate.games),
      averageZombiesOnWinnerBoard: average(aggregate.winnerZombies, aggregate.games),
    },
  };
}

function simulateSeries({
  games = 100,
  difficultyA = 0,
  difficultyB = 0,
} = {}) {
  const aggregate = createAggregate();

  for (let index = 0; index < games; index += 1) {
    const game = runSingleSimulation(difficultyA, difficultyB);
    const stats = game.stats || createAggregate();
    const winnerIndex = getWinnerIndex(game);

    aggregate.games += 1;
    if (winnerIndex === 0) aggregate.wins.player1 += 1;
    if (winnerIndex === 1) aggregate.wins.player2 += 1;
    aggregate.turnsTotal += stats.turnsCompleted || 0;
    aggregate.turnsMin = Math.min(aggregate.turnsMin, stats.turnsCompleted || 0);
    aggregate.turnsMax = Math.max(aggregate.turnsMax, stats.turnsCompleted || 0);
    aggregate.starsBySource.case16 += stats.starsBySource?.case16 || stats.starsBySource?.case12 || 0;
    aggregate.starsBySource.zombie += stats.starsBySource?.zombie || 0;
    aggregate.caseEntries[5] += stats.caseEntries?.[5] || 0;
    aggregate.caseEntries[7] += stats.caseEntries?.[7] || 0;
    aggregate.boardFlip.prompts += stats.boardFlip?.prompts || 0;
    aggregate.boardFlip.used += stats.boardFlip?.used || 0;
    aggregate.boardFlip.skipped += stats.boardFlip?.skipped || 0;
    aggregate.discards.columns += stats.discards?.columns || 0;
    aggregate.discards.cards += stats.discards?.cards || 0;
    Object.entries(stats.discards?.bySource || {}).forEach(([source, values]) => {
      aggregate.discards.bySource[source] = aggregate.discards.bySource[source] || {
        columns: 0,
        cards: 0,
      };
      aggregate.discards.bySource[source].columns += values.columns || 0;
      aggregate.discards.bySource[source].cards += values.cards || 0;
    });
    aggregate.rowRefills += stats.rowRefills || 0;
    aggregate.rowReplacements += stats.rowReplacements || 0;
    aggregate.hiddenCardsPlayedByPlayer[0] += stats.hiddenCardsPlayedByPlayer?.[0] || 0;
    aggregate.hiddenCardsPlayedByPlayer[1] += stats.hiddenCardsPlayedByPlayer?.[1] || 0;
    aggregate.blockedTurns += stats.blockedTurns || 0;
    aggregate.forcedDiscards += stats.forcedDiscards || 0;
    mergeCardMap(aggregate.cardActivations, stats.cardActivations || {});
    mergeCardMap(aggregate.cardMovementTotal, stats.cardMovementTotal || {});
    mergeCardMap(aggregate.replaysGranted, stats.replaysGranted || {});

    const winnerSnapshot = stats.winners?.[stats.winners.length - 1];
    if (winnerSnapshot) {
      aggregate.winnerChiefs += winnerSnapshot.chiefs || 0;
      aggregate.winnerZombies += winnerSnapshot.zombies || 0;
    }
  }

  return buildReport(aggregate);
}

if (require.main === module) {
  const games = Number(process.argv[2] || 100);
  const difficultyA = Number(process.argv[3] || 0);
  const difficultyB = Number(process.argv[4] || difficultyA);

  const report = simulateSeries({ games, difficultyA, difficultyB });
  console.log(JSON.stringify(report, null, 2));
}

module.exports = {
  simulateSeries,
};
