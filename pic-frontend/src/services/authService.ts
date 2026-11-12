import { get, post, setToken, clearToken } from '@/lib/api';
import type { AvatarGender, AvatarStyle, User } from '@/types';

interface AuthResponse {
  token: string;
  user: ApiUser;
}

interface ApiUser {
  id: number;
  name: string;
  gender?: AvatarGender;
  age: number | null;
  profile: {
    profile_photo: string | null;
    avatar_style: AvatarStyle | null;
    avatar_seed: string | null;
    bio: string | null;
    location: string | null;
    interests: string[];
  } | null;
}

function mapUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    gender: u.gender ?? 'neutral',
    email: '',          // not returned by API for privacy — stored locally on login
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

export const authService = {
  async login(email: string, password: string): Promise<User & { token: string }> {
    const res = await post<AuthResponse>('/auth/login', { email, password });
    setToken(res.token);
    return { ...mapUser(res.user), email, token: res.token };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string;
    gender: AvatarGender;
  }): Promise<User & { token: string }> {
    const res = await post<AuthResponse>('/auth/register', data);
    setToken(res.token);
    return { ...mapUser(res.user), email: data.email, token: res.token };
  },

  async getCurrentUser(email: string): Promise<User> {
    const res = await get<{ user: ApiUser }>('/me');
    return { ...mapUser(res.user), email };
  },

  async logout(): Promise<void> {
    await post('/auth/logout', {}).catch(() => undefined);
    clearToken();
  },
};
