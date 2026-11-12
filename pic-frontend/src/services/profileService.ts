import { get, put } from '@/lib/api';
import type { AvatarGender, User } from '@/types';

interface ApiUser {
  id: number;
  name: string;
  gender?: AvatarGender;
  age: number | null;
  profile: {
    profile_photo: string | null;
    avatar_style: User['avatarStyle'] | null;
    avatar_seed: string | null;
    bio: string | null;
    location: string | null;
    interests: string[];
  } | null;
}

function mapUser(u: ApiUser, email = ''): User {
  return {
    id: String(u.id),
    name: u.name,
    gender: u.gender ?? 'neutral',
    email,
    age: u.age ?? undefined,
    avatar: u.profile?.profile_photo ?? undefined,
    avatarStyle: u.profile?.avatar_style ?? undefined,
    avatarSeed: u.profile?.avatar_seed ?? undefined,
    bio: u.profile?.bio ?? undefined,
    location: u.profile?.location ?? undefined,
    interests: u.profile?.interests ?? [],
    createdAt: new Date().toISOString(),
  };
}

export const profileService = {
  async getProfile(): Promise<User> {
    const res = await get<{ user: ApiUser }>('/profile');
    return mapUser(res.user);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const body: Record<string, unknown> = {};
    if (data.name) body.name = data.name;
    if (data.gender) body.gender = data.gender;
    if (data.avatarStyle) body.avatar_style = data.avatarStyle;
    if (data.avatarSeed) body.avatar_seed = data.avatarSeed;
    if (data.bio != null) body.bio = data.bio;
    if (data.location != null) body.location = data.location;
    if (data.interests) body.interests = data.interests;

    const res = await put<{ user: ApiUser }>('/profile', body);
    return mapUser(res.user);
  },
};
