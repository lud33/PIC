import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { picService } from '@/services/picService';
import type { Pic } from '@/types';
import { PicCard } from '@/components/pic/PicCard';
import { PicCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES = ['All', 'Music', 'Sports', 'Art', 'Food', 'Comedy', 'Movies', 'Festivals', 'Gaming'];

export function Discover() {
  const navigate = useNavigate();
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    picService.getActivePics().then(data => {
      setPics(data);
      setLoading(false);
    });
  }, []);

  const filtered = pics.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950">Find your next PIC<span className="text-pink-500">!</span></h1>
        <p className="text-gray-700 text-sm mt-1">People are looking for someone to join them.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search events or locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-black text-sm bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black bg-cyan-300 text-sm font-bold text-black shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all duration-200">
          <SlidersHorizontal size={15} /> Filter
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border
              ${category === cat
                ? 'bg-yellow-300 text-black border-black shadow-[2px_2px_0px_#000]'
                : 'bg-white text-gray-800 border-black hover:bg-pink-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PicCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No PICs found"
          description={search || category !== 'All' ? 'Try adjusting your filters.' : 'Be the first to create a PIC!'}
          action={{ label: 'Create a PIC', onClick: () => navigate('/create-pic') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(pic => <PicCard key={pic.id} pic={pic} />)}
        </div>
      )}
    </div>
  );
}
