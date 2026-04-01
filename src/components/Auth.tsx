import React from 'react';

export const Auth: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Login Page</h2>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Username"
          style={{ padding: '10px', width: '200px' }}
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          type="password"
          placeholder="Password"
          style={{ padding: '10px', width: '200px' }}
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <button style={{ padding: '10px 20px' }}>
          Login
        </button>
      </div>
    </div>
  );
};
