import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markRead, markAllRead } from '../api/notifications';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hozir';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function refreshCount() {
    try {
      const count = await getUnreadCount();
      setUnread(count);
    } catch {
      // silently ignore
    }
  }

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      const data = await getNotifications();
      setItems(data);
      setLoaded(true);
    }
  }

  async function handleItemClick(n) {
    setOpen(false);
    if (!n.is_read) {
      await markRead(n.id);
      setUnread((prev) => Math.max(0, prev - 1));
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: true } : it)));
    }
    if (n.link) navigate(n.link);
  }

  async function handleMarkAll() {
    await markAllRead();
    setUnread(0);
    setItems((prev) => prev.map((it) => ({ ...it, is_read: true })));
  }

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell-btn" onClick={handleToggle} type="button">
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Bildirishnomalar</span>
            {unread > 0 && (
              <button type="button" className="notif-mark-all" onClick={handleMarkAll}>
                Hammasini o'qish
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="search-empty">Hozircha bildirishnoma yo'q</p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                className={n.is_read ? 'notif-item' : 'notif-item unread'}
                onClick={() => handleItemClick(n)}
              >
                <span className="notif-message">{n.message}</span>
                <span className="notif-time">{timeAgo(n.created_at)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;