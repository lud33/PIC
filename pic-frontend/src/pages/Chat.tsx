import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { chatService } from '@/services/chatService';
import { useApp } from '@/context/AppContext';
import type { Conversation } from '@/types';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Skeleton } from '@/components/ui/Skeleton';

export function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    chatService.getConversation(id).then(c => {
      setConv(c ?? null);
      setLoading(false);
    });
    // Load messages separately
    chatService.getMessages(id).then(msgs => {
      setConv(c => c ? { ...c, messages: msgs } : c);
    });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !conv) return;
    setSending(true);
    const msg = await chatService.sendMessage(conv.id, text.trim());
    setConv(c => c ? { ...c, messages: [...c.messages, msg] } : c);
    setText('');
    setSending(false);
  };

  if (loading) return (
    <div className="h-screen flex flex-col">
      <Skeleton className="h-16 rounded-none" />
      <div className="flex-1 p-4 space-y-3">
        {Array.from({length:5}).map((_,i) => <Skeleton key={i} className={`h-10 w-3/4 ${i % 2 ? 'ml-auto' : ''}`} />)}
      </div>
    </div>
  );

  if (!conv) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Conversation not found.</p>
      <button onClick={() => navigate('/messages')} className="mt-4 text-brand hover:underline text-sm">Back to Messages</button>
    </div>
  );

  const others = conv.participants.filter(p => p.id !== currentUser?.id);
  const otherPerson = others[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)] -mx-4 sm:-mx-6 -my-6">
      {/* Header */}
      <div className="bg-yellow-100 border-b-2 border-black px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/messages')} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="flex -space-x-2 mr-1">
          {others.slice(0,3).map(u => <UserAvatar key={u.id} user={u} size="sm" className="ring-2 ring-white" />)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{otherPerson?.name ?? conv.pic.title}</p>
          <p className="text-xs text-gray-400 flex items-center gap-2 truncate">
            <span className="truncate">{conv.pic.title}</span>
            <Calendar size={10} />{format(parseISO(conv.pic.date), 'MMM d')}
            <MapPin size={10} />{conv.pic.location}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FFF8E7]">
        {conv.messages.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400">Say hi to kick things off 👋</div>
        )}
        {conv.messages.map(msg => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <UserAvatar user={msg.sender} size="xs" />}
              <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && msg.sender.name && <span className="text-xs text-gray-400 ml-1">{msg.sender.name.split(' ')[0]}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                  ? 'bg-yellow-300 border-2 border-black text-black shadow-[3px_3px_0px_#000] rounded-2xl rounded-br-sm'
                  : 'bg-white border-2 border-black text-gray-950 shadow-[3px_3px_0px_#000] rounded-2xl rounded-bl-sm'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mx-1">{format(parseISO(msg.createdAt), 'h:mm a')}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-yellow-100 border-t-2 border-black px-4 py-3 flex items-center gap-3 shrink-0">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
          className="flex-1 rounded-xl border-2 border-black px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-pink-400 text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center disabled:opacity-40 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all duration-200"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
