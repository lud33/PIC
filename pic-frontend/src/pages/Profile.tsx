import { useNavigate } from 'react-router-dom';
import { MapPin, Edit2, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/user/UserAvatar';
import { InterestTags } from '@/components/user/InterestTags';
import { Button } from '@/components/ui/Button';

export function Profile() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-4">
          <UserAvatar user={currentUser} size="xl" />
          <Button variant="outline" size="sm" onClick={() => navigate('/profile/edit')}>
            <Edit2 size={14} /> Edit
          </Button>
        </div>
        <h1 className="text-2xl font-black text-gray-950">{currentUser.name}{currentUser.age ? `, ${currentUser.age}` : ''}</h1>
        {currentUser.location && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <MapPin size={13} />{currentUser.location}
          </p>
        )}
        {currentUser.bio && (
          <p className="text-sm text-gray-600 leading-relaxed mt-3">{currentUser.bio}</p>
        )}
        {!currentUser.bio && (
          <button onClick={() => navigate('/profile/edit')} className="text-sm text-brand hover:underline mt-3">
            + Add a bio
          </button>
        )}
      </div>

      {/* Interests */}
      {currentUser.interests.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-3">Interests</h2>
          <InterestTags interests={currentUser.interests} />
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-2xl divide-y divide-gray-100 shadow-card">
        <button onClick={() => navigate('/profile/edit')} className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-t-2xl">
          <span className="font-medium">Edit Profile</span>
          <Edit2 size={15} className="text-gray-400" />
        </button>
        <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 py-4 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl">
          <span className="font-medium">Log out</span>
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}
