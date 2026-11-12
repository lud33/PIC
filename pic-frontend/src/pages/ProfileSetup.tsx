import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { profileService } from '@/services/profileService';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { InterestTags } from '@/components/user/InterestTags';
import { UserAvatar } from '@/components/user/UserAvatar';

export function ProfileSetup() {
  const { currentUser, updateCurrentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i: string) =>
    setInterests(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await profileService.updateProfile({ bio, location, interests });
      updateCurrentUser(updated);
      showToast('Profile set up! Welcome to PIC 🎉');
      navigate('/discover');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <UserAvatar user={currentUser} size="xl" className="mx-auto mb-4" />
          <h1 className="text-3xl font-black text-gray-950">Let's build your PIC profile</h1>
          <p className="text-sm text-gray-500 mt-1">Give people a little context about who they'll be going to events with.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i === 1 ? 'bg-brand' : 'bg-gray-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            label="Bio"
            placeholder="Tell people a bit about yourself and what you enjoy..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            hint="Keep it friendly and genuine."
          />
          <Input
            label="Location"
            placeholder="e.g. London, UK"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Interests</label>
            <p className="text-xs text-gray-400 mb-3">Pick the things you enjoy — this helps others find a great PIC.</p>
            <InterestTags interests={[]} selectable selected={interests} onToggle={toggleInterest} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/discover')} fullWidth>Skip for now</Button>
            <Button type="submit" loading={loading} fullWidth>Complete Setup</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
