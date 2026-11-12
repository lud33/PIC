import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Users, Compass, MessageCircle, CheckCircle2, Star } from 'lucide-react';
import { PICS } from '@/data/mock';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/user/UserAvatar';
import { format, parseISO } from 'date-fns';

export function Landing() {
  const samplePics = PICS.filter(p => p.status === 'active').slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-yellow-100 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-black tracking-tight">PIC<span className="text-pink-500">!</span></span>
            <span className="text-xs font-bold text-gray-700 hidden sm:block">Partner In Crime</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/register"><Button size="sm">Sign up <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <span className="inline-block bg-cyan-300 text-black text-sm font-bold border-2 border-black px-4 py-1.5 rounded-full mb-6 shadow-[3px_3px_0px_#000] rotate-[-2deg]">
          Don't experience great events alone
        </span>
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-gray-950 tracking-tight leading-tight mb-6">
          Find your<br />
          <span className="inline-block text-black bg-yellow-300 border-2 border-black px-4 -rotate-2 shadow-[5px_5px_0px_#000]">PIC!</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-xl mx-auto mb-10">
          Discover people looking for someone to join them at concerts, events, activities, and experiences.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg">
              Find Your PIC <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">Create a PIC</Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
          {[['10K+', 'People connected'], ['5K+', 'Events attended'], ['98%', 'Safe & positive']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="font-black text-black text-lg">{val}</div>
              <div>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Example cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {samplePics.map(pic => (
            <div key={pic.id} className="bg-white rounded-2xl overflow-hidden shadow-card hover:-translate-y-1 transition-transform duration-200">
              <div className="h-40 overflow-hidden">
                {pic.imageUrl ? (
                  <img src={pic.imageUrl} alt={pic.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1.5">{pic.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Calendar size={11} /> {format(parseISO(pic.date), 'EEE, MMM d')} · {pic.time}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin size={11} /> {pic.location}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar user={pic.creator} size="xs" />
                    <span className="text-xs text-gray-600">{pic.creator.name}{pic.creator.age ? `, ${pic.creator.age}` : ''}</span>
                  </div>
                  <span className="text-xs font-medium text-brand flex items-center gap-1">
                    <Users size={11} /> {pic.availableSlots ?? Math.max(0, pic.capacity - (pic.participantsCount ?? pic.participants.length))} spots
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-pink-200 border-y-2 border-black py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-3">How PIC works</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Four simple steps to finding your next companion.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Compass size={28} />, step: '1', title: 'Discover', desc: 'Browse active PICs and find an event that catches your eye.' },
              { icon: <Users size={28} />, step: '2', title: 'Request', desc: 'Send a join request to the creator and tell them you\'re interested.' },
              { icon: <MessageCircle size={28} />, step: '3', title: 'Connect', desc: 'Once accepted, you can chat and arrange the details.' },
              { icon: <CheckCircle2 size={28} />, step: '4', title: 'Go together', desc: 'Meet up and enjoy the experience with your new PIC.' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl border-2 border-black bg-yellow-300 text-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-xs font-bold text-gray-400 mb-1">STEP {s.step}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-12">People love PIC</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { text: '"I was nervous going to a concert alone. Found my PIC in minutes — we had an amazing night and are still friends!"', name: 'Emma R.', role: 'Music fan' },
            { text: '"PIC made it so easy to find someone for the football match. Arrived as strangers, left as mates. Brilliant idea."', name: 'James K.', role: 'Sports fan' },
            { text: '"I use PIC every time I have an extra ticket. The quality of people you meet is genuinely impressive."', name: 'Aisha M.', role: 'Concert-goer' },
          ].map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <div className="flex gap-1 mb-4">{Array.from({length: 5}).map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cyan-300 border-y-2 border-black py-20 text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">Ready to find your PIC?</h2>
        <p className="text-gray-900 text-lg mb-8">Join thousands of people who never go to events alone.</p>
        <Link to="/register">
          <Button variant="secondary" size="lg">Get started — it's free <ArrowRight size={18} /></Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>© 2026 PIC — Partner In Crime. All rights reserved.</p>
      </footer>
    </div>
  );
}
