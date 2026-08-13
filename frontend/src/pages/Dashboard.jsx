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
      <h2>Mening loyihalarim</h2>
      <button onClick={handleLogout}>Chiqish</button>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Yangi loyiha nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Yaratish</button>
      </form>

      <ul>
        {projects.map((p) => (
            <li key={p.id}>
                <Link to={`/projects/${p.id}`}>{p.title}</Link> ({p.genre || 'janr yo\'q'})
            </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;