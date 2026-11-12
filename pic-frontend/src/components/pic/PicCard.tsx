import { Calendar, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import type { Pic } from '@/types';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface PicCardProps {
  pic: Pic;
}

const EVENT_COLORS = ['from-violet-400 to-indigo-500', 'from-rose-400 to-pink-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500', 'from-sky-400 to-blue-500'];

function getColor(id: string) {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return EVENT_COLORS[sum % EVENT_COLORS.length];
}

export function PicCard({ pic }: PicCardProps) {
  const navigate = useNavigate();
  const spotsLeft = pic.availableSlots ?? Math.max(0, pic.capacity - (pic.participantsCount ?? pic.participants.length));
  const isFull = spotsLeft <= 0;

  return (
    <article
      className="bg-white rounded-2xl border-2 border-black overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/pic/${pic.id}`)}
    >
      {/* Image */}
      <div className="h-44 overflow-hidden relative">
        {pic.imageUrl ? (
          <img src={pic.imageUrl} alt={pic.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getColor(pic.id)} flex items-center justify-center`}>
            <span className="text-white text-4xl font-black opacity-30">{pic.title[0]}</span>
          </div>
        )}
        {/* Category badge */}
        {pic.category && (
          <span className="absolute top-3 left-3 bg-yellow-300 text-black text-xs font-bold border-2 border-black px-2.5 py-1 rounded-full">
            {pic.category}
          </span>
        )}
        {/* Status */}
        {isFull && (
          <span className="absolute top-3 right-3 bg-pink-400 text-black text-xs font-bold border-2 border-black px-2.5 py-1 rounded-full">
            Full
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-1">{pic.title}</h3>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} />
            <span>{format(parseISO(pic.date), 'EEE, MMM d')} · {pic.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} />
            <span className="truncate">{pic.location}</span>
          </div>
        </div>

        {/* Host */}
        <div className="flex items-center gap-2 mb-3">
          <UserAvatar user={pic.creator} size="xs" />
          <span className="text-xs text-gray-600 font-medium">{pic.creator.name}{pic.creator.age ? `, ${pic.creator.age}` : ''}</span>
        </div>

        {/* Spots */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            <span>{isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}</span>
          </div>
          <Badge
            label={isFull ? 'Full' : 'Open'}
            color={isFull ? 'red' : 'green'}
            dot
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={e => { e.stopPropagation(); navigate(`/pic/${pic.id}`); }}
        >
          {isFull ? 'Request to Join' : 'Want to Join'}
        </Button>
      </div>
    </article>
  );
}
