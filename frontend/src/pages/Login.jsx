import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import Spinner from '../components/Spinner';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await login(username, password);
    navigate('/dashboard');
  } catch (err) {
    if (err.response && err.response.status === 401) {
      setError('Login yoki parol noto\'g\'ri');
    } else {
      setError('Serverga ulanishda xatolik. Backend ishlab turganini tekshiring.');
    }
  } finally {
    setLoading(false);
  }
}

  return (
  <div style={{ maxWidth: 320, margin: '80px auto', textAlign: 'center' }}>
    <h2>Kirish</h2>
    <form onSubmit={handleSubmit} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Parol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <button type="submit" disabled={loading} className={loading ? 'btn-loading' : ''}>
  {loading && <Spinner size={16} />}
  {loading ? 'Kuting...' : 'Kirish'}
</button>
    </form>
    <p style={{ marginTop: 16 }}>
  Akkauntingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
</p>
  </div>
);
}

export default Login;