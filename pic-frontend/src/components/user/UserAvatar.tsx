import type { User } from '@/types';
import { Y2KAvatar } from '@/components/user/Y2KAvatar';

interface UserAvatarProps {
  user: Pick<User, 'id' | 'name' | 'gender' | 'avatarStyle' | 'avatarSeed'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  return <Y2KAvatar account={user} gender={user.gender ?? 'neutral'} size={size} className={className} />;
}
