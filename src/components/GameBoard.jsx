import CardView from "./CardView";
import Stars from "./Stars";

const COLUMN_WIDTH = 176;
const COLUMN_CARD_AREA_MIN_HEIGHT = 170;
const STACK_CARD_HEIGHT = 148;
const STACK_STEP = 34;

function getColumnValue(column) {
  for (let index = column.length - 1; index >= 0; index -= 1) {
    const card = column[index];

    if (card.faceUp !== false) {
      return card.value;
    }
  }

  return null;
}

function renderColumn(player, columnIndex, anchorToCenter = "bottom") {
  const column = player.columns[columnIndex];
  const columnValue = getColumnValue(column);
  const stackHeight = Math.max(
    STACK_CARD_HEIGHT,
    STACK_CARD_HEIGHT + Math.max(0, column.length - 1) * STACK_STEP
  );
  const moonCount =
    (player.columnMoons?.[columnIndex] || 0) +
    column.reduce(
      (total, card) => total + ((card.faceUp === false || card.moon) ? 1 : 0),
      0
    );

  return (
    <div
      style={{
        width: COLUMN_WIDTH,
        border: "1px solid #cbd5e1",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
        borderRadius: 18,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
        boxSizing: "border-box",
        boxShadow: "0 18px 34px rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textAlign: "center",
          color: "#334155",
        }}
      >
        <div>Col {columnIndex + 1}</div>
        <div style={{ minHeight: 20, fontSize: 16, marginTop: 3 }}>
          {moonCount > 0 ? "🌙".repeat(moonCount) : ""}
        </div>
        <div
          style={{
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            minWidth: 72,
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(37,99,235,0.08)",
            color: "#1d4ed8",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          <span>Valeur</span>
          <span>{columnValue ?? "-"}</span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          minHeight: Math.max(COLUMN_CARD_AREA_MIN_HEIGHT, stackHeight),
          display: "flex",
          justifyContent: anchorToCenter === "bottom" ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: stackHeight,
          }}
        >
          {column.map((card, index) => {
            const offset = (column.length - 1 - index) * STACK_STEP;

            return (
              <div
                key={card.id}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: index + 1,
                  ...(anchorToCenter === "bottom"
                    ? { bottom: offset }
                    : { top: offset }),
                }}
              >
                <CardView card={card} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getZoneIndexFromPosition(position) {
  if (position < 0) return 0;
  if (position <= 2) return 0;
  if (position <= 5) return 1;
  if (position <= 8) return 2;
  return 3;
}

function getCellEffect(value) {
  if (value === 4) return "Stop";
  if (value === 6) return "Retourner";
  if (value === 8) return "Stop";
  return "";
}

function Zone({
  start,
  end,
  player1Position,
  player2Position,
  label,
  effectText,
  animationState,
}) {
  const player1ZoneIndex = getZoneIndexFromPosition(player1Position);
  const player2ZoneIndex = getZoneIndexFromPosition(player2Position);
  const zoneIndex = Math.floor(start / 3);
  const p1HandHere = player1ZoneIndex === zoneIndex;
  const p2HandHere = player2ZoneIndex === zoneIndex;

  return (
    <div
      style={{
        width: COLUMN_WIDTH,
        minHeight: 142,
        border: "1px solid #cbd5e1",
        borderRadius: 16,
        background: "#f8fafc",
        padding: 10,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 12, textAlign: "center", color: "#334155" }}>
        Cases {start}-{end}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {Array.from({ length: 3 }, (_, index) => {
          const value = start + index;
          const p1Here = player1Position === value;
          const p2Here = player2Position === value;
          const cellEffect = getCellEffect(value);
          const p1Moved = animationState?.movedPlayers?.includes(0) && p1Here;
          const p2Moved = animationState?.movedPlayers?.includes(1) && p2Here;

          return (
            <div
              key={value}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                minHeight: 58,
                background: cellEffect ? "#fef3c7" : "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 4,
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#92400e", textAlign: "center" }}>
                {cellEffect}
              </div>
              <div style={{ fontSize: 10, color: "#0f172a" }}>
                {p1Here ? <div style={p1Moved ? movingTokenStyle : tokenStyle}>J1</div> : null}
                {p2Here ? <div style={p2Moved ? movingTokenStyle : tokenStyle}>J2</div> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, textAlign: "center", color: "#475569", lineHeight: 1.35 }}>
        <div>{label}</div>
        <div>{effectText}</div>
        <div style={{ marginTop: 4, fontWeight: 700 }}>
          {p1HandHere ? "Zone de J1" : ""}
          {p1HandHere && p2HandHere ? " / " : ""}
          {p2HandHere ? "Zone de J2" : ""}
        </div>
      </div>
    </div>
  );
}

function StarZone({ player1Position, player2Position, animationState }) {
  const p1Here = player1Position === 12;
  const p2Here = player2Position === 12;
  const animateStar = Boolean(animationState?.starBurst);

  return (
    <div
      style={{
        width: 120,
        minHeight: 142,
        border: "2px solid #f59e0b",
        borderRadius: 18,
        background: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)",
        padding: 10,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 16px 28px rgba(245,158,11,0.18)",
        animation: animateStar ? "starBurst 900ms ease-out" : "none",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 12, color: "#92400e" }}>Case 12</div>
      <div style={{ fontSize: 34, lineHeight: 1 }}>⭐</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>Etoile</div>
      <div style={{ fontSize: 10, color: "#78350f" }}>
        {p1Here ? <div>J1</div> : null}
        {p2Here ? <div>J2</div> : null}
      </div>
    </div>
  );
}

function PlayerHeader({ player, active, shorthand = false, winning = false }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 6 }}>
      {shorthand ? (
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: active ? "#2563eb" : "#475569",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          J{active ? active : ""}
        </div>
      ) : (
        <>
          <div
            style={{
              fontWeight: 900,
              fontSize: 17,
              color: active ? "#2563eb" : "#0f172a",
              animation: winning ? "victoryGlow 1400ms ease-in-out infinite" : "none",
            }}
          >
            {player.name}
          </div>
          <Stars count={player.stars} />
        </>
      )}
    </div>
  );
}

export default function GameBoard({
  players,
  currentPlayer,
  winner,
  activePlayerBlocked,
  canInteract,
  onColumnClick,
  animationState,
}) {
  const zones = [
    { start: 0, end: 2, label: "Zone 1", effectText: "" },
    { start: 3, end: 5, label: "Zone 2", effectText: "Case 4 : stop" },
    { start: 6, end: 8, label: "Zone 3", effectText: "Case 6 : retourner / Case 8 : stop" },
    { start: 9, end: 11, label: "Zone 4", effectText: "" },
  ];

  return (
    <div style={{ marginTop: 8, overflowX: "auto", paddingBottom: 10 }}>
      <div style={{ minWidth: 920 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(4, ${COLUMN_WIDTH}px)`,
            gap: 12,
            alignItems: "end",
          }}
        >
          {players[0].columns.map((_, columnIndex) => (
            <div key={`p1-head-${columnIndex}`}>
              {columnIndex === 0 ? (
                <PlayerHeader
                  player={players[0]}
                  active={currentPlayer === 0}
                  winning={winner === players[0].name && animationState?.victory}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    color: currentPlayer === 0 ? "#2563eb" : "#64748b",
                    marginBottom: 10,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  J1
                </div>
              )}
            </div>
          ))}

          {players[0].columns.map((_, columnIndex) => (
            <div
              key={`p1-col-${columnIndex}`}
              onClick={() => {
                if (!winner && currentPlayer === 0 && canInteract) {
                  onColumnClick(columnIndex);
                }
              }}
              style={{
                cursor: !winner && currentPlayer === 0 && canInteract ? "pointer" : "default",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {renderColumn(players[0], columnIndex, "bottom")}
            </div>
          ))}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(4, ${COLUMN_WIDTH}px) 120px`,
              gap: 12,
              alignItems: "start",
              gridColumn: "1 / -1",
              margin: "8px 0",
            }}
          >
            {zones.map((zone) => (
              <Zone
                key={`zone-${zone.start}`}
                start={zone.start}
                end={zone.end}
                label={zone.label}
                effectText={zone.effectText}
                player1Position={players[0].position}
                player2Position={players[1].position}
                animationState={animationState}
              />
            ))}
            <StarZone
              player1Position={players[0].position}
              player2Position={players[1].position}
              animationState={animationState}
            />
          </div>

          {players[1].columns.map((_, columnIndex) => (
            <div
              key={`p2-col-${columnIndex}`}
              onClick={() => {
                if (!winner && currentPlayer === 1 && canInteract) {
                  onColumnClick(columnIndex);
                }
              }}
              style={{
                cursor: !winner && currentPlayer === 1 && canInteract ? "pointer" : "default",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {renderColumn(players[1], columnIndex, "top")}
            </div>
          ))}

          {players[1].columns.map((_, columnIndex) => (
            <div key={`p2-foot-${columnIndex}`}>
              {columnIndex === 0 ? (
                <div style={{ textAlign: "center", marginTop: 6 }}>
                  <Stars count={players[1].stars} />
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 17,
                      color: currentPlayer === 1 ? "#2563eb" : "#0f172a",
                      animation:
                        winner === players[1].name && animationState?.victory
                          ? "victoryGlow 1400ms ease-in-out infinite"
                          : "none",
                    }}
                  >
                    {players[1].name}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    color: currentPlayer === 1 ? "#2563eb" : "#64748b",
                    marginTop: 12,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  J2
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {activePlayerBlocked && !winner ? (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            border: "1px solid #fdba74",
            borderRadius: 14,
            background: "#fff7ed",
            color: "#9a3412",
            fontWeight: 800,
          }}
        >
          Aucun coup possible : choisissez une de vos colonnes a defausser.
        </div>
      ) : null}
    </div>
  );
}

const tokenStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1px 4px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.12)",
  fontWeight: 700,
};

const movingTokenStyle = {
  ...tokenStyle,
  animation: "tokenHop 600ms ease-out",
  background: "rgba(59,130,246,0.2)",
};
