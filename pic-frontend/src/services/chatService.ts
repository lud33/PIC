import { get, post } from '@/lib/api';
import type { AvatarGender, AvatarStyle, Conversation, Message } from '@/types';

interface ApiMessage {
  id: number;
  conversation_id: number;
  message: string;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    gender?: AvatarGender;
    age: number | null;
    profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null } | null;
  };
}

interface ApiConversation {
  id: number;
  created_at: string;
  pic?: {
    id: number;
    event_name: string;
    event_date: string;
    event_time: string;
    location: string;
    status: string;
    people_needed: number;
    participants_count: number;
    available_slots: number;
    description: string;
    category: string | null;
    cover_image: string | null;
    owner?: { id: number; name: string; gender?: AvatarGender; age: number | null; profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null };
    participants?: Array<{ id: number; name: string; gender?: AvatarGender; age: number | null; profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null }>;
  };
  participants?: Array<{ id: number; name: string; gender?: AvatarGender; age: number | null; profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null }>;
  last_message?: ApiMessage | null;
}

interface PaginatedResponse<T> { data: T[] }

interface NumberedPaginatedResponse<T> extends PaginatedResponse<T> {
  meta: { current_page: number; last_page: number };
}

function mapUser(u: { id: number; name: string; gender?: AvatarGender; age: number | null; profile: { profile_photo: string | null; avatar_style: AvatarStyle | null; avatar_seed: string | null; bio: string | null; location: string | null; interests: string[] } | null }) {
  return {
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
  };
}

function mapMessage(m: ApiMessage): Message {
  return {
    id: String(m.id),
    conversationId: String(m.conversation_id),
    senderId: m.sender ? String(m.sender.id) : '',
    sender: m.sender
      ? { id: String(m.sender.id), name: m.sender.name, gender: m.sender.gender ?? 'neutral', email: '', interests: [], createdAt: '', avatar: m.sender.profile?.profile_photo ?? undefined, avatarStyle: m.sender.profile?.avatar_style ?? undefined, avatarSeed: m.sender.profile?.avatar_seed ?? undefined }
      : { id: '', name: '', email: '', interests: [], createdAt: '' },
    text: m.message,
    createdAt: m.created_at,
  };
}

function mapConversation(c: ApiConversation): Conversation {
  const pic = c.pic;
  const owner = pic?.owner ? mapUser(pic.owner) : { id: '', name: '', email: '', interests: [], createdAt: '' };

  return {
    id: String(c.id),
    picId: pic ? String(pic.id) : '',
    pic: {
      id: pic ? String(pic.id) : '',
      title: pic?.event_name ?? '',
      date: pic?.event_date ?? '',
      time: pic?.event_time ?? '',
      location: pic?.location ?? '',
      description: pic?.description ?? '',
      category: pic?.category ?? undefined,
      capacity: pic?.people_needed ?? 0,
      creatorId: owner.id,
      creator: owner,
      participants: (pic?.participants ?? []).map(mapUser),
      status: (pic?.status ?? 'active') as import('@/types').PicStatus,
      imageUrl: pic?.cover_image ?? undefined,
      createdAt: c.created_at,
    },
    participants: (c.participants ?? []).map(mapUser),
    messages: [],
    lastMessage: c.last_message ? mapMessage(c.last_message) : undefined,
    unreadCount: 0,
  };
}

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const conversations: ApiConversation[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await get<NumberedPaginatedResponse<ApiConversation>>(`/conversations?page=${page}`);
      conversations.push(...res.data);
      lastPage = res.meta.last_page;
      page = res.meta.current_page + 1;
    } while (page <= lastPage);

    return conversations.map(mapConversation);
  },

  async getConversation(id: string): Promise<Conversation | undefined> {
    const res = await get<{ data: ApiConversation }>(`/conversations/${id}`).catch(() => null);
    if (!res) return undefined;
    return mapConversation(res.data);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const res = await get<PaginatedResponse<ApiMessage>>(`/conversations/${conversationId}/messages`);
    return res.data.map(mapMessage);
  },

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const res = await post<{ data: ApiMessage }>(`/conversations/${conversationId}/messages`, { message: text });
    return mapMessage(res.data);
  },

  // Not used with real backend — conversation is created server-side on request acceptance
  async createConversation(): Promise<Conversation> {
    throw new Error('Conversations are created server-side when a join request is accepted.');
  },
};
