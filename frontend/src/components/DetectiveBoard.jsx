import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  getBoardItems, createBoardItem, updateBoardItemPosition, deleteBoardItem,
  getBoardConnections, createBoardConnection, deleteBoardConnection,
} from '../api/board';

const CARD_WIDTH = 150;
const CARD_HEIGHT = 70;
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;

function randomPosition(index) {
  const cols = 6;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return { x: 40 + col * 190, y: 40 + row * 130 };
}

function DetectiveBoard({ projectId, characters, evidenceList, timelineEvents }) {
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [linkMode, setLinkMode] = useState(false);
  const [pendingFrom, setPendingFrom] = useState(null);
  const dragRef = useRef(null);

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  async function loadBoard() {
    const [itemsData, connectionsData] = await Promise.all([
      getBoardItems(projectId),
      getBoardConnections(projectId),
    ]);
    setItems(itemsData);
    setConnections(connectionsData);
  }

  function resolveItemData(item) {
    if (item.item_type === 'character') {
      const c = characters.find((x) => x.id === item.ref_id);
      return { title: c ? c.name : 'O\'chirilgan personaj', subtitle: '👤', link: c ? `/characters/${c.id}` : null };
    }
    if (item.item_type === 'evidence') {
      const ev = evidenceList.find((x) => x.id === item.ref_id);
      return { title: ev ? ev.name : 'O\'chirilgan dalil', subtitle: '🔍', link: null };
    }
    if (item.item_type === 'event') {
      const ev = timelineEvents.find((x) => x.id === item.ref_id);
      return { title: ev ? ev.title : 'O\'chirilgan voqea', subtitle: '🕐', link: null };
    }
    return { title: item.note_text || 'Yozuv', subtitle: '📌', link: null };
  }

  async function handleAddExisting(itemType, refId) {
    if (!refId) return;
    const position = randomPosition(items.length);
    const created = await createBoardItem({
      project: projectId,
      item_type: itemType,
      ref_id: Number(refId),
      x: position.x,
      y: position.y,
    });
    setItems((prev) => [...prev, created]);
  }

  async function handleAddNote() {
    const text = window.prompt('Yozuv matnini kiriting:');
    if (!text || !text.trim()) return;
    const position = randomPosition(items.length);
    const created = await createBoardItem({
      project: projectId,
      item_type: 'note',
      note_text: text,
      x: position.x,
      y: position.y,
    });
    setItems((prev) => [...prev, created]);
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm('Bu narsani taxtadan olib tashlaymizmi?')) return;
    await deleteBoardItem(itemId);
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    setConnections((prev) => prev.filter((c) => c.from_item !== itemId && c.to_item !== itemId));
  }

  function handleCardMouseDown(e, item) {
    if (linkMode) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = item.x;
    const originY = item.y;
    dragRef.current = { itemId: item.id };

    function onMouseMove(moveEvent) {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setItems((prev) => prev.map((it) =>
        it.id === item.id ? { ...it, x: originX + dx, y: originY + dy } : it
      ));
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setItems((prev) => {
        const updated = prev.find((it) => it.id === item.id);
        if (updated) updateBoardItemPosition(updated.id, updated.x, updated.y);
        return prev;
      });
      dragRef.current = null;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  async function handleCardClick(item) {
    if (!linkMode) return;
    if (!pendingFrom) {
      setPendingFrom(item.id);
      return;
    }
    if (pendingFrom === item.id) {
      setPendingFrom(null);
      return;
    }
    const label = window.prompt('Bog\'lanish izohi (ixtiyoriy):', '') || '';
    const created = await createBoardConnection({
      project: projectId,
      from_item: pendingFrom,
      to_item: item.id,
      label,
    });
    setConnections((prev) => [...prev, created]);
    setPendingFrom(null);
  }

  async function handleDeleteConnection(connId) {
    if (!window.confirm('Bu bog\'lanishni o\'chirmoqchimisiz?')) return;
    await deleteBoardConnection(connId);
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  }

  const attachedKeys = new Set(items.map((it) => `${it.item_type}-${it.ref_id}`));
  const availableCharacters = characters.filter((c) => !attachedKeys.has(`character-${c.id}`));
  const availableEvidence = evidenceList.filter((e) => !attachedKeys.has(`evidence-${e.id}`));
  const availableEvents = timelineEvents.filter((e) => !attachedKeys.has(`event-${e.id}`));

  function itemCenter(itemId) {
    const item = items.find((it) => it.id === itemId);
    if (!item) return null;
    return { x: item.x + CARD_WIDTH / 2, y: item.y + CARD_HEIGHT / 2 };
  }

  return (
    <div>
      <div className="board-toolbar">
        <select onChange={(e) => { handleAddExisting('character', e.target.value); e.target.value = ''; }} defaultValue="">
          <option value="" disabled>+ Personaj qo'shish</option>
          {availableCharacters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select onChange={(e) => { handleAddExisting('evidence', e.target.value); e.target.value = ''; }} defaultValue="">
          <option value="" disabled>+ Dalil qo'shish</option>
          {availableEvidence.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <select onChange={(e) => { handleAddExisting('event', e.target.value); e.target.value = ''; }} defaultValue="">
          <option value="" disabled>+ Voqea qo'shish</option>
          {availableEvents.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <button type="button" onClick={handleAddNote}>+ Yozuv</button>
        <button
          type="button"
          className={linkMode ? 'board-link-btn active' : 'board-link-btn'}
          onClick={() => { setLinkMode(!linkMode); setPendingFrom(null); }}
        >
          🔗 {linkMode ? 'Bog\'lash rejimi (faol)' : 'Bog\'lash'}
        </button>
      </div>

      {linkMode && (
        <p className="muted" style={{ fontSize: 13 }}>
          {pendingFrom ? 'Endi ikkinchi elementni bosing...' : 'Bog\'lanishni boshlash uchun birinchi elementni bosing.'}
        </p>
      )}

      <div className="board-canvas-wrapper">
        <div className="board-canvas" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <svg className="board-svg" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            {connections.map((conn) => {
              const from = itemCenter(conn.from_item);
              const to = itemCenter(conn.to_item);
              if (!from || !to) return null;
              return (
                <g key={conn.id}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="var(--danger)" strokeWidth="10" opacity="0"
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onClick={() => handleDeleteConnection(conn.id)}
                  />
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="var(--danger)" strokeWidth="1.5" opacity="0.6"
                    style={{ pointerEvents: 'none' }}
                  />
                  {conn.label && (
                    <text
                      x={(from.x + to.x) / 2} y={(from.y + to.y) / 2}
                      fontSize="10" fill="var(--text)" fontFamily="Segoe UI, sans-serif"
                      textAnchor="middle" style={{ pointerEvents: 'none' }}
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {items.map((item) => {
            const data = resolveItemData(item);
            const isPending = pendingFrom === item.id;
            return (
              <div
                key={item.id}
                className={isPending ? 'board-card pending' : 'board-card'}
                style={{ left: item.x, top: item.y, width: CARD_WIDTH }}
                onMouseDown={(e) => handleCardMouseDown(e, item)}
                onClick={() => handleCardClick(item)}
              >
                <button
                  type="button"
                  className="board-card-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                >
                  ✕
                </button>
                <div className="board-card-subtitle">{data.subtitle}</div>
                {data.link ? (
                  <Link to={data.link} className="board-card-title" onClick={(e) => e.stopPropagation()}>
                    {data.title}
                  </Link>
                ) : (
                  <div className="board-card-title">{data.title}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DetectiveBoard;