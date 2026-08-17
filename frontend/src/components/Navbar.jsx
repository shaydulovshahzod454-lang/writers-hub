import { Link, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../api/auth';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav>
      <div className="nav-brand">
  <Link to="/">
    <img src={logo} alt="Writers Hub" className="nav-logo" />
  </Link>
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