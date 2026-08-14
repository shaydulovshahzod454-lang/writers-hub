import { Link, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../api/auth';

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav>
      <div className="nav-brand">
        <Link to="/dashboard">📖 Writers Hub</Link>
      </div>
      {isAuthenticated() && (
        <div className="nav-actions">
          <Link to="/dashboard">Loyihalarim</Link>
          <button onClick={handleLogout}>Chiqish</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;