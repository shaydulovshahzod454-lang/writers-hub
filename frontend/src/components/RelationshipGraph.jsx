import { useNavigate } from 'react-router-dom';

const WIDTH = 600;
const HEIGHT = 420;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const RADIUS = Math.min(WIDTH, HEIGHT) / 2 - 70;
const NODE_RADIUS = 26;

function getNodePositions(characters) {
  const count = characters.length;
  const positions = {};
  characters.forEach((c, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions[c.id] = {
      x: CENTER_X + RADIUS * Math.cos(angle),
      y: CENTER_Y + RADIUS * Math.sin(angle),
    };
  });
  return positions;
}

function RelationshipGraph({ characters, relationships }) {
  const navigate = useNavigate();

  if (characters.length === 0) {
    return <p className="empty-state">Grafik uchun avval personaj qo'shing.</p>;
  }

  const positions = getNodePositions(characters);
  const pairCounts = {};

  return (
    <div className="graph-wrapper">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="relationship-graph">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
          </marker>
        </defs>

        {relationships.map((rel) => {
          const from = positions[rel.from_character];
          const to = positions[rel.to_character];
          if (!from || !to) return null;

          const pairKey = [rel.from_character, rel.to_character].sort().join('-');
          pairCounts[pairKey] = (pairCounts[pairKey] || 0);
          const offsetIndex = pairCounts[pairKey];
          pairCounts[pairKey] += 1;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const startRatio = NODE_RADIUS / dist;
          const startX = from.x + dx * startRatio;
          const startY = from.y + dy * startRatio;
          const endRatio = (dist - NODE_RADIUS) / dist;
          const endX = from.x + dx * endRatio;
          const endY = from.y + dy * endRatio;

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2 + offsetIndex * 14;

          return (
            <g key={rel.id}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="var(--accent)"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
                opacity="0.7"
              />
              <rect
                x={midX - rel.relationship_type.length * 3.2 - 4}
                y={midY - 9}
                width={rel.relationship_type.length * 6.4 + 8}
                height="16"
                fill="var(--surface)"
                rx="3"
              />
              <text
                x={midX}
                y={midY + 3}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text)"
                fontFamily="Segoe UI, sans-serif"
              >
                {rel.relationship_type}
              </text>
            </g>
          );
        })}

        {characters.map((c) => {
          const pos = positions[c.id];
          return (
            <g
              key={c.id}
              className="graph-node"
              onClick={() => navigate(`/characters/${c.id}`)}
            >
              <circle cx={pos.x} cy={pos.y} r={NODE_RADIUS} fill="var(--accent)" />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontFamily="Segoe UI, sans-serif"
                fontWeight="bold"
              >
                {c.name.length > 10 ? c.name.slice(0, 9) + '…' : c.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default RelationshipGraph;