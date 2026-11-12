import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Login() {
  const { login, showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await login(email, password);
      showToast('Welcome back!');
      navigate('/discover');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <span className="text-3xl font-black text-black">PIC<span className="text-pink-500">!</span></span>
      </Link>
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-8">
        <h1 className="text-3xl font-black text-gray-950 mb-1">Welcome back!</h1>
        <p className="text-sm text-gray-500 mb-6">Log in to find your next PIC.</p>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            icon={<Mail size={16} />}
            autoComplete="email"
          />
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock size={16} />}
            rightElement={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600" aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            autoComplete="current-password"
          />
          <div className="text-right">
            <button type="button" className="text-xs text-brand hover:underline">Forgot password?</button>
          </div>
          <Button type="submit" fullWidth loading={loading}>Log In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
