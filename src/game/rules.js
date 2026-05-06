export function getTopValue(column) {
  if (column.length === 0) return 0;

  for (let index = column.length - 1; index >= 0; index -= 1) {
    const card = column[index];

    if (card.faceUp !== false) {
      return card.value;
    }
  }

  return 0;
}

export function canPlaceCardInColumn(card, column) {
  return card.value >= getTopValue(column);
}

export function drawCards(deck, count) {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export function canPlayAnyCard(row, columns) {
  return row.some((card) =>
    columns.some((column) => canPlaceCardInColumn(card, column))
  );
}
