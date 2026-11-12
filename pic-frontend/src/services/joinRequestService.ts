import { get, post } from '@/lib/api';
import type { AvatarGender, AvatarStyle, JoinRequest, RequestStatus, Pic } from '@/types';

interface ApiRequest {
  id: number;
  status: RequestStatus;
  created_at: string;
  pic?: {
    id: number;
    event_name: string;
    event_date: string;
    event_time: string;
    location: string;
    status: string;
  };
  sender?: {
    id: number;
    name: string;
    gender?: AvatarGender;
    age: number | null;
    profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null;
  };
}

interface PaginatedResponse<T> { data: T[] }

function mapRequest(r: ApiRequest, currentUserId: string): JoinRequest {
  return {
    id: String(r.id),
    picId: r.pic ? String(r.pic.id) : '',
    requesterId: r.sender ? String(r.sender.id) : currentUserId,
    requester: r.sender
      ? {
          id: String(r.sender.id),
          name: r.sender.name,
          gender: r.sender.gender ?? 'neutral',
          email: '',
          age: r.sender.age ?? undefined,
          avatar: r.sender.profile?.profile_photo ?? undefined,
          avatarStyle: r.sender.profile?.avatar_style ?? undefined,
          avatarSeed: r.sender.profile?.avatar_seed ?? undefined,
          bio: r.sender.profile?.bio ?? undefined,
          location: r.sender.profile?.location ?? undefined,
          interests: r.sender.profile?.interests ?? [],
          createdAt: '',
        }
      : { id: currentUserId, name: '', email: '', interests: [], createdAt: '' },
    status: r.status,
    createdAt: r.created_at,
  };
}

export const joinRequestService = {
  async getMyRequest(picId: string): Promise<RequestStatus | null> {
    const res = await get<{ data: ApiRequest | null }>(`/pics/${picId}/my-request`);
    return res.data?.status ?? null;
  },

  async getRequestsForPic(picId: string): Promise<JoinRequest[]> {
    const res = await get<PaginatedResponse<ApiRequest>>(`/pics/${picId}/requests`);
    return res.data.map(r => mapRequest(r, ''));
  },

  async getRequestStatus(_picId: string, _currentUserId: string): Promise<RequestStatus | null> {
    // Inferred from the PIC detail — no dedicated endpoint needed
    // We check via my join requests cached in context; fall back to null
    return null;
  },

  async sendRequest(picId: string, _pic: Pic): Promise<JoinRequest> {
    const res = await post<{ data: ApiRequest }>(`/pics/${picId}/join`, {});
    return mapRequest(res.data, '');
  },

  async acceptRequest(requestId: string): Promise<JoinRequest> {
    const res = await post<{ data: ApiRequest }>(`/join-requests/${requestId}/accept`, {});
    return mapRequest(res.data, '');
  },

  async declineRequest(requestId: string): Promise<JoinRequest> {
    const res = await post<{ data: ApiRequest }>(`/join-requests/${requestId}/decline`, {});
    return mapRequest(res.data, '');
  },
};
