import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Folder, MessageCircle, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { chatService } from '@/services/chatService';
import { useApp } from '@/context/AppContext';
import type { Conversation } from '@/types';
import { UserAvatar } from '@/components/user/UserAvatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export function Messages() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openPicIds, setOpenPicIds] = useState<Set<string>>(() => new Set());

  const loadConversations = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      setConvs(await chatService.getConversations());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  const conversationsByPic = convs.reduce<Map<string, Conversation[]>>((groups, conv) => {
    const eventConversations = groups.get(conv.picId) ?? [];
    eventConversations.push(conv);
    groups.set(conv.picId, eventConversations);
    return groups;
  }, new Map());
  const filteredGroups = Array.from(conversationsByPic).filter(([, eventConversations]) =>
    eventConversations[0].pic.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );

  const togglePic = (picId: string) => {
    setOpenPicIds(current => {
      const updated = new Set(current);
      if (updated.has(picId)) updated.delete(picId);
      else updated.add(picId);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-950">Messages</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : loadError ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-card">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            onClick={() => void loadConversations()}
            className="mt-3 text-sm font-medium text-brand hover:underline"
          >
            Try again
          </button>
        </div>
      ) : convs.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={48} />}
          title="No messages yet"
          description="When someone accepts your request or you get accepted, a conversation will appear here."
        />
      ) : (
        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white px-4 py-3 shadow-[3px_3px_0px_#000]">
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search events..."
              aria-label="Search events"
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </label>

          {filteredGroups.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-card">
              No events match your search.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map(([picId, eventConversations]) => {
                const isOpen = openPicIds.has(picId);
                const eventTitle = eventConversations[0].pic.title || 'Untitled event';

                return (
                  <section key={picId} className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000]">
                    <button
                      type="button"
                      onClick={() => togglePic(picId)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-yellow-50"
                    >
                      <Folder size={20} className="shrink-0 text-brand" />
                      <span className="min-w-0 flex-1 truncate font-semibold text-gray-900">{eventTitle}</span>
                      <span className="text-xs text-gray-500">
                        {eventConversations.length} {eventConversations.length === 1 ? 'chat' : 'chats'}
                      </span>
                      <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="space-y-2 border-t-2 border-black bg-yellow-50 p-3">
                        {eventConversations.map(conv => {
                          const otherPeople = conv.participants.filter(person => person.id !== currentUser?.id);
                          const last = conv.lastMessage ?? conv.messages[conv.messages.length - 1];

                          return (
                            <button
                              key={conv.id}
                              type="button"
                              onClick={() => navigate(`/messages/${conv.id}`)}
                              className="flex w-full items-center gap-3 rounded-xl border-2 border-black bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]"
                            >
                              <div className="flex -space-x-2">
                                {otherPeople.slice(0, 3).map(person => (
                                  <UserAvatar key={person.id} user={person} size="sm" className="ring-2 ring-white" />
                                ))}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="truncate text-sm font-semibold text-gray-900">
                                    {otherPeople.map(person => person.name).join(', ') || 'Private chat'}
                                  </span>
                                  {last && (
                                    <span className="shrink-0 text-xs text-gray-400">
                                      {format(parseISO(last.createdAt), 'h:mm a')}
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-xs text-gray-500">
                                  {last ? (last.sender.name ? `${last.sender.name.split(' ')[0]}: ${last.text}` : last.text) : 'No messages yet'}
                                </p>
                              </div>
                              {conv.unreadCount > 0 && (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
