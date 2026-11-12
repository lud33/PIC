import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Calendar, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { picService } from '@/services/picService';
import type { Pic } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export function Passed() {
  const navigate = useNavigate();
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    picService.getPassedPics().then(data => { setPics(data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950">Passed <span className="text-pink-500">PICs</span></h1>
        <p className="text-sm text-gray-500 mt-1">Your previous PIC experiences.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : pics.length === 0 ? (
        <EmptyState
          icon={<History size={48} />}
          title="No passed PICs yet"
          description="Events you've attended will appear here."
          action={{ label: 'Discover PICs', onClick: () => navigate('/discover') }}
        />
      ) : (
        <div className="space-y-3">
          {pics.map(pic => (
            <div key={pic.id} className="bg-white rounded-2xl p-4 shadow-card flex flex-col sm:flex-row gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 grayscale">
                {pic.imageUrl
                  ? <img src={pic.imageUrl} alt={pic.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-950 truncate">{pic.title}</h3>
                  <span className="shrink-0 text-xs font-bold text-black bg-lime-300 border-2 border-black px-2 py-0.5 rounded-full">Passed</span>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={11} />{format(parseISO(pic.date), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11} />{pic.location}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Users size={11} />
                    {pic.creator.name}{(pic.participantsCount ?? pic.participants.length) > 0 ? ` + ${pic.participantsCount ?? pic.participants.length} other${(pic.participantsCount ?? pic.participants.length) !== 1 ? 's' : ''}` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/pic/${pic.id}`)}>View Details</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
