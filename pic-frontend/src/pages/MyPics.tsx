import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Eye, MessageCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { picService } from '@/services/picService';
import type { Pic, PicStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PicStatusBadge } from '@/components/pic/PicStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

const TABS: { label: string; status: PicStatus | 'all' }[] = [
  { label: 'All', status: 'all' },
  { label: 'Active', status: 'active' },
  { label: 'Full', status: 'full' },
  { label: 'Deactivated', status: 'deactivated' },
];

export function MyPics() {
  const navigate = useNavigate();
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PicStatus | 'all'>('all');

  useEffect(() => {
    picService.getMyPics().then(data => { setPics(data); setLoading(false); });
  }, []);

  const filtered = tab === 'all' ? pics : pics.filter(p => p.status === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950">My PICs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your event posts.</p>
        </div>
        {tab !== 'deactivated' && (
          <Button size="sm" onClick={() => navigate('/create-pic')}>+ Create PIC</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-black overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.status}
            onClick={() => setTab(t.status)}
            className={`pb-3 px-2 text-sm font-bold transition-colors border-b-4 -mb-0.5
              ${tab === t.status ? 'text-black border-pink-500' : 'text-gray-600 border-transparent hover:text-black'}`}
          >
            {t.label}
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {t.status === 'all' ? pics.length : pics.filter(p => p.status === t.status).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No PICs here"
          description={tab === 'deactivated' ? 'PICs you deactivate will appear here.' : 'Create your first PIC to get started.'}
          action={tab === 'deactivated' ? undefined : { label: 'Create a PIC', onClick: () => navigate('/create-pic') }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(pic => {
            const participantCount = pic.participantsCount ?? pic.participants.length;
            return (
              <div key={pic.id} className="bg-white rounded-2xl p-4 shadow-card flex flex-col sm:flex-row gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                {pic.imageUrl
                  ? <img src={pic.imageUrl} alt={pic.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{pic.title}</h3>
                  <PicStatusBadge status={pic.status} />
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={11} />{format(parseISO(pic.date), 'EEE, MMM d')} · {pic.time}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} />{pic.location}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Users size={11} />{participantCount}/{pic.capacity} participants</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pic/${pic.id}`)}><Eye size={13} /> View</Button>
                  {participantCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/pic/${pic.id}`)}><MessageCircle size={13} /> Chat</Button>
                  )}
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
