import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login } from '../api/auth';
import Spinner from '../components/Spinner';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await register(username, email, password);
    await login(username, password);
    navigate('/dashboard');
  } catch (err) {
    if (err.response?.data) {
      const messages = Object.values(err.response.data).flat().join(' ');
      setError(messages || 'Ro\'yxatdan o\'tishda xatolik');
    } else {
      setError('Ro\'yxatdan o\'tishda xatolik');
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', textAlign: 'center' }}>
      <h2>Ro'yxatdan o'tish</h2>
      <form onSubmit={handleSubmit} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
  {loading ? 'Kuting...' : 'Ro\'yxatdan o\'tish'}
</button>
      </form>
      <p style={{ marginTop: 16 }}>
        Akkauntingiz bormi? <Link to="/login">Kirish</Link>
      </p>
    </div>
  );
}

export default Register;