import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, MessageCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { notificationService } from '@/services/notificationService';
import { useApp } from '@/context/AppContext';
import type { Notification } from '@/types';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const icons = {
  join_request: <Users size={16} className="text-brand" />,
  request_accepted: <CheckCircle2 size={16} className="text-green-500" />,
  request_declined: <Bell size={16} className="text-gray-400" />,
  message: <MessageCircle size={16} className="text-blue-400" />,
};

export function Notifications() {
  const { refreshNotifications, showToast } = useApp();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  useEffect(() => {
    notificationService.getNotifications().then(data => { setNotifs(data); setLoading(false); });
    notificationService.markAllRead().then(refreshNotifications);
  }, [refreshNotifications]);

  const handleClick = (n: Notification) => {
    notificationService.markRead(n.id);
    if (n.type === 'join_request' && n.picId) navigate(`/pic/${n.picId}`);
    if (n.type === 'request_accepted' && n.picId) navigate(`/pic/${n.picId}`);
    if (n.type === 'message' && n.picId) navigate(`/messages`);
  };

  const handleRemove = async (id: string) => {
    setRemovingIds(ids => [...ids, id]);
    try {
      await notificationService.remove(id);
      setNotifs(items => items.filter(notification => notification.id !== id));
      refreshNotifications();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not remove notification.', 'error');
    } finally {
      setRemovingIds(ids => ids.filter(removingId => removingId !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950">Notifications</h1>
        {notifs.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={() => notificationService.markAllRead().then(() => setNotifs(n => n.map(x => ({...x, read: true}))))}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : notifs.length === 0 ? (
        <EmptyState icon={<Bell size={48} />} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 border-black transition-all duration-200 ${n.read ? 'bg-white shadow-[3px_3px_0px_#000]' : 'bg-yellow-200 shadow-card'}`}
            >
              <button
                type="button"
                onClick={() => handleClick(n)}
                className="flex flex-1 min-w-0 items-start gap-4 text-left"
              >
                <UserAvatar user={n.actor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {icons[n.type]}
                    {!n.read && <span className="w-2 h-2 bg-brand rounded-full" aria-label="Unread" />}
                  </div>
                  <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}</p>
                </div>
                {n.type === 'join_request' && (
                  <span className="shrink-0 text-xs font-semibold text-brand bg-primary-50 px-2 py-1 rounded-lg">Review</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => void handleRemove(n.id)}
                disabled={removingIds.includes(n.id)}
                aria-label={`Remove notification: ${n.message}`}
                className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-pink-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
