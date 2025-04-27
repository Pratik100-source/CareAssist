import React from 'react';
import './header.css';
import {logout} from "../../features/userSlice";
import { useDispatch } from 'react-redux';
const Header = () => {

  const dispatch = useDispatch();
  return (
    <div className="header">
      <div className="header-left">
        <span>Welcome to Admin Panel</span>
      </div>
      <div className="header-right">
        <button onClick={()=>{dispatch(logout())}}>Logout</button>
      </div>
    </div>
  );
};

export default Header;