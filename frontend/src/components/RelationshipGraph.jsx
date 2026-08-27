import { useNavigate } from 'react-router-dom';

function getLayout(count) {
  const nodeRadius = count > 12 ? 18 : count > 8 ? 22 : 26;
  const radius = Math.max(140, 40 + count * 20);
  const size = radius * 2 + nodeRadius * 2 + 60;
  return {
    width: size,
    height: size,
    centerX: size / 2,
    centerY: size / 2,
    radius,
    nodeRadius,
  };
}

function getNodePositions(characters, layout) {
  const count = characters.length;
  const positions = {};
  characters.forEach((c, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions[c.id] = {
      x: layout.centerX + layout.radius * Math.cos(angle),
      y: layout.centerY + layout.radius * Math.sin(angle),
    };
  });
  return positions;
}

function RelationshipGraph({ characters, relationships }) {
  const navigate = useNavigate();

  if (characters.length === 0) {
    return <p className="empty-state">Grafik uchun avval personaj qo'shing.</p>;
  }

  const layout = getLayout(characters.length);
  const positions = getNodePositions(characters, layout);
  const fontSize = layout.nodeRadius < 22 ? 9 : 11;

  return (
    <div className="graph-wrapper">
      <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="relationship-graph">
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

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const startRatio = layout.nodeRadius / dist;
          const startX = from.x + dx * startRatio;
          const startY = from.y + dy * startRatio;
          const endRatio = (dist - layout.nodeRadius) / dist;
          const endX = from.x + dx * endRatio;
          const endY = from.y + dy * endRatio;

          return (
            <line
              key={rel.id}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="var(--accent)"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
              opacity="0.55"
              className="graph-edge"
            >
              <title>{rel.from_character_name} → {rel.to_character_name}: {rel.relationship_type}</title>
            </line>
          );
        })}

        {characters.map((c) => {
          const pos = positions[c.id];
          const label = c.name.length > 10 ? c.name.slice(0, 9) + '…' : c.name;
          return (
            <g
              key={c.id}
              className="graph-node"
              onClick={() => navigate(`/characters/${c.id}`)}
            >
              <circle cx={pos.x} cy={pos.y} r={layout.nodeRadius} fill="var(--accent)" />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize={fontSize}
                fill="white"
                fontFamily="Segoe UI, sans-serif"
                fontWeight="bold"
              >
                {label}
                <title>{c.name}</title>
              </text>
            </g>
          );
        })}
      </svg>
      <p className="graph-hint muted">💡 Chiziq yoki nuqta ustiga sichqonchani olib borsangiz, tafsilot ko'rinadi</p>
    </div>
  );
}

export default RelationshipGraph;