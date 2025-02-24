import React from 'react';
import './header.css';

const Header = () => {
  return (
    <div className="header">
      <div className="header-left">
        <span>Welcome to Admin Panel</span>
      </div>
      <div className="header-right">
        <button>Logout</button>
      </div>
    </div>
  );
};

export default Header;