import React from 'react';
import '../styles/Login.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faRightToBracket } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // later: call your OAuth / JWT backend here
    console.log("Login submitted");
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2><FontAwesomeIcon icon={faRightToBracket} /> Flexitec Login</h2>

        <div className="input-group">
          <label>Email</label>
          <div className="input-icon">
            <FontAwesomeIcon icon={faUser} />
            <input type="email" placeholder="you@example.com" required />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-icon">
            <FontAwesomeIcon icon={faLock} />
            <input type="password" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" className="login-button">Login</button>

        <div className="oauth-section">
          <p>Or sign in with</p>
          <button className="google-login">Google</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
