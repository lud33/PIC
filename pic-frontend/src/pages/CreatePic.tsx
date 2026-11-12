import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, FileText as _FileText } from 'lucide-react';
import { picService } from '@/services/picService';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PicStatusBadge } from '@/components/pic/PicStatusBadge';
import { format, parseISO } from 'date-fns';

const CATEGORIES = ['Music', 'Sports', 'Art', 'Food', 'Comedy', 'Movies', 'Festivals', 'Gaming', 'Culture', 'Outdoors'];

export function CreatePic() {
  const { currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', date: '', time: '', location: '', description: '', category: '', capacity: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: field === 'capacity' ? Number(e.target.value) : e.target.value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Event name is required.';
    if (!form.date) e.date = 'Date is required.';
    if (!form.time) e.time = 'Time is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const pic = await picService.createPic({
        title: form.title,
        date: new Date(form.date).toISOString(),
        time: form.time,
        location: form.location,
        description: form.description,
        category: form.category || undefined,
        capacity: form.capacity,
      });
      showToast('PIC created! It\'s now live in Discover.');
      navigate(`/pic/${pic.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950">Create a PIC<span className="text-pink-500">!</span></h1>
        <p className="text-gray-500 text-sm mt-1">Going somewhere and don't want to go alone?</p>
      </div>

      <div className="lg:grid lg:grid-cols-5 lg:gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <Input
            label="Event name"
            placeholder='e.g. "Concert Night"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={set('date')} error={errors.date} icon={<Calendar size={15} />} />
            <Input label="Time" type="time" value={form.time} onChange={set('time')} error={errors.time} icon={<Clock size={15} />} />
          </div>
          <Input label="Location" placeholder="Venue or address" value={form.location} onChange={set('location')} error={errors.location} icon={<MapPin size={15} />} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category (optional)</label>
              <select
                value={form.category}
                onChange={set('category')}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Users size={14} className="inline mr-1" />Looking for
              </label>
              <select
                value={form.capacity}
                onChange={set('capacity')}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} person{n !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <Textarea
            label="Description"
            placeholder="Tell people a little about the event and what you're looking for..."
            value={form.description}
            onChange={set('description')}
            error={errors.description}
            rows={4}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" fullWidth loading={loading}>Create PIC</Button>
          </div>
        </form>

        {/* Preview (desktop only) */}
        {(form.title || form.date || form.location) && (
          <div className="hidden lg:block lg:col-span-2">
            <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-3">Preview</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="h-32 bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-3xl font-black opacity-30">{form.title?.[0] ?? '?'}</span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">{form.title || 'Event name'}</h3>
                {form.date && <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={11} />{format(parseISO(form.date), 'EEE, MMM d')} {form.time && `· ${form.time}`}</p>}
                {form.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} />{form.location}</p>}
                {currentUser && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-5 h-5 rounded-full bg-primary-100 text-brand text-[10px] font-bold flex items-center justify-center">
                      {currentUser.name[0]}
                    </div>
                    <span className="text-xs text-gray-600">{currentUser.name}</span>
                  </div>
                )}
                <div className="pt-1"><PicStatusBadge status="active" /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
