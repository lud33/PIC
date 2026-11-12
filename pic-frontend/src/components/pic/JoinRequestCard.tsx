import type { JoinRequest } from '@/types';
import { MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/user/UserAvatar';
import { InterestTags } from '@/components/user/InterestTags';
import { Button } from '@/components/ui/Button';

interface JoinRequestCardProps {
  request: JoinRequest;
  currentUserInterests: string[];
  onAccept: () => void;
  onDecline: () => void;
}

export function JoinRequestCard({ request, currentUserInterests, onAccept, onDecline }: JoinRequestCardProps) {
  const { requester } = request;
  const shared = requester.interests.filter(i => currentUserInterests.includes(i));

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <UserAvatar user={requester} size="lg" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{requester.name}{requester.age ? `, ${requester.age}` : ''}</p>
          {requester.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{requester.location}</p>
          )}
          {requester.bio && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{requester.bio}</p>}
        </div>
      </div>
      {requester.interests.length > 0 && <InterestTags interests={requester.interests} />}
      {shared.length > 0 && (
        <p className="text-xs text-brand font-medium">✓ Shared interests: {shared.join(', ')}</p>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" fullWidth onClick={onDecline}>Decline</Button>
        <Button size="sm" fullWidth onClick={onAccept}>Accept</Button>
      </div>
    </div>
  );
}
