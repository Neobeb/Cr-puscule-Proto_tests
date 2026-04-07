import { CREATURES } from "../data/creatures";

export default function CardView({
  card,
  isLeftmost = false,
  isSelected = false,
}) {
  const creature = CREATURES[card.type];
  const isFaceUp = card.faceUp !== false;
  const background = isFaceUp
    ? creature?.color || "white"
    : "linear-gradient(135deg, #1e293b 0%, #334155 100%)";
  const textColor = isFaceUp ? "#0f172a" : "white";
  const displayedValue = isFaceUp ? card.value : 0;

  return (
    <div
      style={{
        background,
        border: isSelected ? "3px solid blue" : "1px solid black",
        borderRadius: 8,
        padding: 8,
        minWidth: 96,
        textAlign: "center",
        position: "relative",
        color: textColor,
      }}
    >
      <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4 }}>
        {isFaceUp && card.moon ? (
          <span title="Lune" style={badgeStyle}>
            🌙
          </span>
        ) : null}
        {isFaceUp && card.chief ? (
          <span title="Chef" style={badgeStyle}>
            👑
          </span>
        ) : null}
        {!isFaceUp ? (
          <span title="Recto" style={badgeStyle}>
            +1
          </span>
        ) : null}
      </div>

      <div style={{ fontSize: 28, marginBottom: 6 }}>
        {isFaceUp ? creature?.icon || "?" : "🂠"}
      </div>

      <div style={{ fontSize: 12, fontWeight: "bold" }}>
        {isFaceUp ? creature?.label || card.type : "Carte retournee"}
      </div>

      <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 4 }}>
        {displayedValue}
      </div>

      {!isFaceUp ? (
        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.9 }}>Effet joue : +1</div>
      ) : null}

      {isLeftmost ? <div style={{ marginTop: 6, fontSize: 11 }}>gauche</div> : null}
    </div>
  );
}

const badgeStyle = {
  fontSize: 13,
  lineHeight: 1,
  background: "rgba(255,255,255,0.85)",
  color: "#0f172a",
  borderRadius: 999,
  padding: "2px 4px",
};
