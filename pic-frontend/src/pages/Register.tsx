import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AvatarGender } from '@/types';

export function Register() {
  const { register: doRegister, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', dob: '', gender: 'neutral' as AvatarGender });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'At least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.dob) e.dob = 'Date of birth is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await doRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        date_of_birth: form.dob,
        gender: form.gender,
      });
      showToast("Account created! Let's set up your profile.");
      navigate('/profile/setup');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrors({ email: msg });
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
        <h1 className="text-3xl font-black text-gray-950 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Join thousands who never go to events alone.</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Full name" placeholder="Your name" value={form.name} onChange={set('name')} error={errors.name} icon={<User size={16} />} autoComplete="name" />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} icon={<Mail size={16} />} autoComplete="email" />
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            icon={<Lock size={16} />}
            rightElement={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600" aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            autoComplete="new-password"
          />
          <Input label="Confirm password" type={showPw ? 'text' : 'password'} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} icon={<Lock size={16} />} autoComplete="new-password" />
          <Input label="Date of birth" type="date" value={form.dob} onChange={set('dob')} error={errors.dob} />
          <div>
            <label htmlFor="gender" className="mb-1.5 block text-sm font-bold text-gray-900">Gender for your avatar</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={event => setForm(current => ({ ...current, gender: event.target.value as AvatarGender }))}
              className="w-full rounded-xl border-2 border-black bg-white px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoComplete="sex"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="neutral">Neutral</option>
            </select>
            <p className="mt-1.5 text-xs text-gray-600">Used to personalize your generated avatar.</p>
          </div>
          <Button type="submit" fullWidth loading={loading}>Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
