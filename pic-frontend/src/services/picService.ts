import { get, post, put } from '@/lib/api';
import type { AvatarGender, AvatarStyle, Pic, PicStatus } from '@/types';

interface ApiPic {
  id: number;
  event_name: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  people_needed: number;
  status: PicStatus;
  category: string | null;
  cover_image: string | null;
  participants_count: number;
  available_slots: number;
  created_at: string;
  owner?: {
    id: number;
    name: string;
    gender?: AvatarGender;
    age: number | null;
    profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null;
  };
  participants?: Array<{
    id: number;
    name: string;
    gender?: AvatarGender;
    age: number | null;
    profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null;
  }>;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: { current_page: number; last_page: number };
}

function mapPic(p: ApiPic): Pic {
  const owner = p.owner
    ? {
        id: String(p.owner.id),
        name: p.owner.name,
        gender: p.owner.gender ?? 'neutral',
        email: '',
        age: p.owner.age ?? undefined,
        avatar: p.owner.profile?.profile_photo ?? undefined,
        avatarStyle: p.owner.profile?.avatar_style ?? undefined,
        avatarSeed: p.owner.profile?.avatar_seed ?? undefined,
        bio: p.owner.profile?.bio ?? undefined,
        location: p.owner.profile?.location ?? undefined,
        interests: p.owner.profile?.interests ?? [],
        createdAt: '',
      }
    : { id: '', name: 'Unknown', email: '', interests: [], createdAt: '' };

  return {
    id: String(p.id),
    title: p.event_name,
    date: p.event_date,
    time: p.event_time,
    location: p.location,
    description: p.description,
    category: p.category ?? undefined,
    capacity: p.people_needed,
    participantsCount: p.participants_count,
    availableSlots: p.available_slots,
    creatorId: owner.id,
    creator: owner,
    participants: (p.participants ?? []).map(u => ({
      id: String(u.id),
      name: u.name,
      gender: u.gender ?? 'neutral',
      email: '',
      age: u.age ?? undefined,
      avatar: u.profile?.profile_photo ?? undefined,
      avatarStyle: u.profile?.avatar_style ?? undefined,
      avatarSeed: u.profile?.avatar_seed ?? undefined,
      bio: u.profile?.bio ?? undefined,
      location: u.profile?.location ?? undefined,
      interests: u.profile?.interests ?? [],
      createdAt: '',
    })),
    status: p.status,
    imageUrl: p.cover_image ?? undefined,
    createdAt: p.created_at,
  };
}

export const picService = {
  async getActivePics(params: Record<string, string> = {}): Promise<Pic[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await get<PaginatedResponse<ApiPic>>(`/pics${qs ? '?' + qs : ''}`);
    return res.data.map(mapPic);
  },

  async getMyPics(): Promise<Pic[]> {
    const res = await get<PaginatedResponse<ApiPic>>('/my-pics');
    return res.data.map(mapPic);
  },

  async getPassedPics(): Promise<Pic[]> {
    const res = await get<PaginatedResponse<ApiPic>>('/passed');
    return res.data.map(mapPic);
  },

  async getPicById(id: string): Promise<Pic | undefined> {
    const res = await get<{ data: ApiPic }>(`/pics/${id}`).catch(() => null);
    if (!res) return undefined;
    return mapPic(res.data);
  },

  async createPic(data: Omit<Pic, 'id' | 'creatorId' | 'creator' | 'participants' | 'status' | 'createdAt'>): Promise<Pic> {
    const body = {
      event_name:    data.title,
      description:   data.description,
      location:      data.location,
      event_date:    data.date.split('T')[0],
      event_time:    data.time,
      people_needed: data.capacity,
      category:      data.category,
    };
    const res = await post<{ data: ApiPic }>('/pics', body);
    return mapPic(res.data);
  },

  async updatePic(id: string, data: Partial<Pic>): Promise<Pic> {
    const body: Record<string, unknown> = {};
    if (data.title)       body.event_name    = data.title;
    if (data.description) body.description   = data.description;
    if (data.location)    body.location      = data.location;
    if (data.date)        body.event_date    = data.date.split('T')[0];
    if (data.time)        body.event_time    = data.time;
    if (data.capacity)    body.people_needed = data.capacity;
    if (data.category)    body.category      = data.category;

    const res = await put<{ data: ApiPic }>(`/pics/${id}`, body);
    return mapPic(res.data);
  },

  async updateStatus(id: string, status: PicStatus): Promise<Pic> {
    if (status === 'deactivated') {
      const res = await post<{ data: ApiPic }>(`/pics/${id}/deactivate`, {});
      return mapPic(res.data);
    }
    if (status === 'active') {
      const res = await post<{ data: ApiPic }>(`/pics/${id}/activate`, {});
      return mapPic(res.data);
    }
    throw new Error('Use deactivate endpoint for status changes.');
  },

  async addParticipant(): Promise<void> {
    // Handled server-side when a join request is accepted
  },

  async leavePic(id: string): Promise<void> {
    await post(`/pics/${id}/leave`, {});
  },
};
