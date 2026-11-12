export type PicStatus = 'active' | 'full' | 'deactivated' | 'passed';
export type RequestStatus = 'pending' | 'accepted' | 'declined';
export type NotificationType = 'join_request' | 'request_accepted' | 'request_declined' | 'message';
export type AvatarGender = 'female' | 'male' | 'neutral';
export type AvatarStyle = 'avataaars' | 'lorelei' | 'adventurer' | 'pixel-art' | 'bottts';

export interface User {
  id: string;
  name: string;
  gender?: AvatarGender;
  avatarStyle?: AvatarStyle;
  avatarSeed?: string;
  email: string;
  avatar?: string;
  age?: number;
  bio?: string;
  location?: string;
  interests: string[];
  createdAt: string;
}

export interface Pic {
  id: string;
  title: string;
  date: string;          // ISO date string
  time: string;          // "HH:mm"
  location: string;
  description: string;
  category?: string;
  capacity: number;      // total spots
  participantsCount?: number;
  availableSlots?: number;
  creatorId: string;
  creator: User;
  participants: User[];
  status: PicStatus;
  imageUrl?: string;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  picId: string;
  pic?: Pic;
  requesterId: string;
  requester: User;
  status: RequestStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  picId: string;
  pic: Pic;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  actorId: string;
  actor: User;
  picId?: string;
  pic?: Pic;
  requestId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
