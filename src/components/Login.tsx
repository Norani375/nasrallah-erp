import { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Default credentials - can be changed
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('erp_logged_in', 'true');
      onLogin();
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-300 to-base-100 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <span className="text-4xl">🪵</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">نصرالله فرنیچر</h1>
            <p className="text-sm text-base-content/60 mt-1">سیستم مدیریت یکپارچه</p>
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2 mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">نام کاربری</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <User size={18} className="opacity-50" />
                <input
                  type="text"
                  className="grow"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  autoFocus
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">رمز عبور</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock size={18} className="opacity-50" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="grow"
                  placeholder="••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4">
              <Lock size={16} /> ورود به سیستم
            </button>
          </form>

          <p className="text-center text-xs text-base-content/40 mt-6">
            نسخه ۱.۰ — نصرالله فرنیچر © ۲۰۲۶
          </p>
        </div>
      </div>
    </div>
  );
};
