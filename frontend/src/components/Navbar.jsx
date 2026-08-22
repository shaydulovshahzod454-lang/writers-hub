import { Link, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated, getUsername } from '../api/auth';
import logoIcon from '../assets/logo-icon.png';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav>
      <div className="nav-brand">
        <Link to={authed ? '/dashboard' : '/'}>
          <img src={logoIcon} alt="" className="nav-logo" />
          <span>Writers Hub</span>
        </Link>
      </div>
      {authed ? (
        <div className="nav-actions">
          <NotificationBell />
          <span className="nav-username">👤 {getUsername()}</span>
          <Link to="/dashboard">Loyihalarim</Link>
          <button onClick={handleLogout}>Chiqish</button>
        </div>
      ) : (
        <div className="nav-actions">
          <Link to="/login">Kirish</Link>
          <Link to="/register" className="nav-register-btn">Ro'yxatdan o'tish</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;