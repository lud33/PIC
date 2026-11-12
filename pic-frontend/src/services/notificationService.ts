import { del, get, post } from '@/lib/api';
import type { AvatarGender, AvatarStyle, Notification } from '@/types';

interface ApiNotification {
  id: string;
  type: string;
  data: {
    message: string;
    pic_post_id?: number;
    join_request_id?: number;
    sender_id?: number;
    sender_name?: string;
    sender_gender?: AvatarGender;
    sender_avatar_style?: AvatarStyle | null;
    sender_avatar_seed?: string | null;
    event_name?: string;
  };
  read: boolean;
  read_at: string | null;
  created_at: string;
}

interface PaginatedResponse<T> { data: T[] }

function mapNotification(n: ApiNotification): Notification {
  const type = n.type.toLowerCase().includes('accepted')
    ? 'request_accepted'
    : n.type.toLowerCase().includes('declined')
    ? 'request_declined'
    : n.type.toLowerCase().includes('received')
    ? 'join_request'
    : 'message';

  return {
    id: n.id,
    type,
    actorId: String(n.data.sender_id ?? ''),
    actor: {
      id: String(n.data.sender_id ?? ''),
      name: n.data.sender_name ?? 'Someone',
      gender: n.data.sender_gender ?? 'neutral',
      avatarStyle: n.data.sender_avatar_style ?? undefined,
      avatarSeed: n.data.sender_avatar_seed ?? undefined,
      email: '',
      interests: [],
      createdAt: '',
    },
    picId: n.data.pic_post_id ? String(n.data.pic_post_id) : undefined,
    requestId: n.data.join_request_id ? String(n.data.join_request_id) : undefined,
    message: n.data.message,
    read: n.read,
    createdAt: n.created_at,
  };
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const res = await get<PaginatedResponse<ApiNotification>>('/notifications');
    return res.data.map(mapNotification);
  },

  async getUnreadCount(): Promise<number> {
    const res = await get<PaginatedResponse<ApiNotification>>('/notifications');
    return res.data.filter(n => !n.read).length;
  },

  async markRead(id: string): Promise<void> {
    await post(`/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<void> {
    await post('/notifications/read-all', {});
  },

  async remove(id: string): Promise<void> {
    await del(`/notifications/${id}`);
  },
};
