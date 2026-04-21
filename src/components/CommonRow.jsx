import CardView from "./CardView";

export default function CommonRow({
  row,
  selectedCardIndex,
  onSelectCard,
  disabled,
}) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
      {row.map((card, index) => {
        const isSelected = selectedCardIndex === index;

        if (!card) {
          return (
            <div
              key={`empty-slot-${index}`}
              style={{
                width: 112,
                height: 172,
                borderRadius: 14,
                border: "1px dashed rgba(100,116,139,0.45)",
                background: "rgba(241,245,249,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Emplacement {index + 1}
            </div>
          );
        }

        return (
          <button
            key={card.id}
            onClick={() => onSelectCard(index)}
            disabled={disabled}
            style={{
              padding: 0,
              background: "transparent",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <CardView card={card} isSelected={isSelected} isLeftmost={index === 0} />
          </button>
        );
      })}
    </div>
  );
}
