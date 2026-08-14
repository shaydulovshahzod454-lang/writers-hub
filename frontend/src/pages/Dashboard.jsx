import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../api/projects';
import { logout } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await createProject({ title });
    setTitle('');
    loadProjects();
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) return <p>Yuklanmoqda...</p>;

  return (
  <div>
    <div className="page-header">
      <h2>Mening loyihalarim</h2>
    </div>

    <form onSubmit={handleCreate} className="inline-form">
      <input
        type="text"
        placeholder="Yangi loyiha nomi"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">+ Yaratish</button>
    </form>

    {projects.length === 0 ? (
      <p className="empty-state">Hali loyiha yo'q. Birinchisini yarating!</p>
    ) : (
      <div className="project-grid">
        {projects.map((p) => (
          <Link to={`/projects/${p.id}`} key={p.id} className="project-card">
            <h3>{p.title}</h3>
            <p className="muted">{p.genre || 'Janr belgilanmagan'}</p>
            {p.description && <p className="card-desc">{p.description}</p>}
          </Link>
        ))}
      </div>
    )}
  </div>
);
}

export default Dashboard;