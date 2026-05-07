import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const NAV_ITEMS = [
  { path: '/', label: 'PORTFOLIO' },
  { path: '/about', label: 'ABOUT' },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="header brutal-divider">
      <div className="header__inner container">
        <Link to="/" className="header__logo">
          <span className="header__logo-text">iAN</span>
        </Link>

        <nav className="header__nav">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`header__nav-link ${
                  isActive ? 'header__nav-link--active' : ''
                }`}
              >
                {isActive && <span className="header__nav-bracket">[</span>}
                {item.label}
                {isActive && <span className="header__nav-bracket">]</span>}
              </Link>
            );
          })}
        </nav>

        <div className="header__counter">
          <span className="header__counter-num">35mm</span>
        </div>
      </div>
    </header>
  );
}
