import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { profileService } from '@/services/profileService';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { InterestTags } from '@/components/user/InterestTags';
import { UserAvatar } from '@/components/user/UserAvatar';
import { AvatarPicker } from '@/components/user/AvatarPicker';
import type { AvatarGender, AvatarStyle } from '@/types';

export function EditProfile() {
  const { currentUser, updateCurrentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: currentUser?.name ?? '',
    gender: currentUser?.gender ?? 'neutral',
    bio: currentUser?.bio ?? '',
    location: currentUser?.location ?? '',
  });
  const [interests, setInterests] = useState<string[]>(currentUser?.interests ?? []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i: string) =>
    setInterests(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i]);

  const saveAvatar = async (avatarStyle: AvatarStyle, avatarSeed: string) => {
    const updated = await profileService.updateProfile({ avatarStyle, avatarSeed });
    updateCurrentUser(updated);
    showToast('Avatar saved!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await profileService.updateProfile({ ...form, interests });
      updateCurrentUser(updated);
      showToast('Profile updated!');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-gray-950">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={currentUser} size="lg" />
            <p className="text-sm font-medium text-gray-700">Your generated avatar</p>
          </div>
          <AvatarPicker account={currentUser} onSave={saveAvatar} />
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          <div>
            <label htmlFor="gender" className="mb-1.5 block text-sm font-bold text-gray-900">Gender for your avatar</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={event => setForm(f => ({ ...f, gender: event.target.value as AvatarGender }))}
              className="w-full rounded-xl border-2 border-black bg-white px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoComplete="sex"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="neutral">Neutral</option>
            </select>
            <p className="mt-1.5 text-xs text-gray-600">Used to personalize your generated avatar.</p>
          </div>
          <Textarea label="Bio" value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={3} placeholder="Tell people about yourself..." />
          <Input label="Location" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="e.g. London, UK" />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-3">Interests</h2>
          <InterestTags interests={[]} selectable selected={interests} onToggle={toggleInterest} />
        </div>

        <div className="flex gap-3 pb-4">
          <Button type="button" variant="outline" fullWidth onClick={() => navigate('/profile')}>Cancel</Button>
          <Button type="submit" fullWidth loading={loading}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
