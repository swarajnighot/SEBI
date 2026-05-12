import React, { useState } from 'react';

const USERS = [
  { username: 'admin', password: 'sebi2025' },
];

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [shaking, setShaking]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const match = USERS.find(
      u => u.username === username.trim() && u.password === password
    );
    if (match) {
      setError('');
      onLogin({ username: match.username });
    } else {
      setError('Invalid username or password.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="login-bg">
      <div className={`login-card${shaking ? ' login-shake' : ''}`}>
        <div className="login-brand">
          <span className="login-brand-dot" aria-hidden="true" />
          <span className="login-brand-name">SEBI Monitor</span>
        </div>

        <h2 className="login-heading">Sign in to continue</h2>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="login-input"
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter username"
              spellCheck={false}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Password</label>
            <div className="login-pw-wrap">
              <input
                id="login-password"
                className="login-input"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="login-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
