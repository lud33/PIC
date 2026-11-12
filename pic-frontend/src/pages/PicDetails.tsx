import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, MoreVertical, MessageCircle, Flag } from 'lucide-react';
import { addDays, format, parseISO, isPast } from 'date-fns';
import { picService } from '@/services/picService';
import { joinRequestService } from '@/services/joinRequestService';
import type { Pic, RequestStatus, JoinRequest } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { UserAvatar } from '@/components/user/UserAvatar';
import { InterestTags } from '@/components/user/InterestTags';
import { PicStatusBadge } from '@/components/pic/PicStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { JoinRequestCard } from '@/components/pic/JoinRequestCard';

export function PicDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();
  const [pic, setPic] = useState<Pic | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [seatsToAdd, setSeatsToAdd] = useState(1);
  const [dateDraft, setDateDraft] = useState('');
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [showSafety, setShowSafety] = useState(false);

  const isOwner = pic?.creatorId === currentUser?.id;
  const isPassed = pic ? isPast(parseISO(pic.date)) || pic.status === 'passed' : false;
  const participantCount = pic ? pic.participantsCount ?? pic.participants.length : 0;
  const isFull = pic ? (pic.availableSlots ?? Math.max(0, pic.capacity - participantCount)) === 0 : false;

  useEffect(() => {
    if (!id) return;
    picService.getPicById(id).then(p => {
      setPic(p ?? null);
      setDateDraft(p?.date ?? '');
      setLoading(false);

      const isOwner = p?.creatorId === currentUser?.id;
      if (isOwner) {
        joinRequestService.getRequestsForPic(id)
          .then(reqs => setPendingRequests(reqs.filter(r => r.status === 'pending')))
          .catch(() => {});
      } else {
        joinRequestService.getMyRequest(id)
          .then(status => { if (status) setRequestStatus(status); })
          .catch(() => {});
      }
    });
  }, [id, currentUser?.id]);

  const handleJoin = async () => {
    if (!pic || !currentUser) return;
    setRequestLoading(true);
    try {
      await joinRequestService.sendRequest(pic.id, pic);
      setRequestStatus('pending');
      showToast(`Request sent to ${pic.creator.name}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong.', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!pic) return;
    setStatusLoading(true);
    try {
      const updatedPic = await picService.updateStatus(pic.id, 'deactivated');
      setPic(updatedPic);
      setShowDeactivate(false);
      showToast('PIC deactivated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not deactivate PIC.', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!pic) return;
    setStatusLoading(true);
    try {
      const updatedPic = await picService.updateStatus(pic.id, 'active');
      setPic(updatedPic);
      showToast(updatedPic.status === 'full' ? 'PIC reactivated and remains full.' : 'PIC reactivated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not activate PIC.', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveDate = async () => {
    if (!pic || !dateDraft || dateDraft === pic.date) return;
    setDateLoading(true);
    try {
      const updatedPic = await picService.updatePic(pic.id, { date: dateDraft });
      setPic(updatedPic);
      setDateDraft(updatedPic.date);
      showToast('PIC date updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update PIC date.', 'error');
    } finally {
      setDateLoading(false);
    }
  };

  const handleAddSeats = async () => {
    if (!pic || seatsToAdd < 1 || pic.capacity + seatsToAdd > 20) return;
    setCapacityLoading(true);
    try {
      const updatedPic = await picService.updatePic(pic.id, { capacity: pic.capacity + seatsToAdd });
      setPic(updatedPic);
      setSeatsToAdd(1);
      showToast(`Capacity increased to ${updatedPic.capacity}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not increase capacity.', 'error');
    } finally {
      setCapacityLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, _requesterId: string) => {
    const requester = pendingRequests.find(r => r.id === requestId)?.requester;
    if (!requester || !pic) return;
    try {
      await joinRequestService.acceptRequest(requestId);
      const updatedPic = await picService.getPicById(pic.id);
      if (updatedPic) setPic(updatedPic);
      setPendingRequests(r => r.filter(x => x.id !== requestId));
      showToast(`${requester.name} has joined your PIC!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not accept request.', 'error');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await joinRequestService.declineRequest(requestId);
      setPendingRequests(r => r.filter(x => x.id !== requestId));
      showToast('Request declined.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not decline request.', 'error');
    }
  };

  const handleOpenChat = () => {
    if (!pic) return;
    navigate('/messages');
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  if (!pic) return (
    <div className="text-center py-20">
      <p className="text-gray-500">PIC not found.</p>
      <Button variant="ghost" onClick={() => navigate('/discover')} className="mt-4">Back to Discover</Button>
    </div>
  );

  const spotsLeft = pic.availableSlots ?? Math.max(0, pic.capacity - participantCount);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-black transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero image */}
      <div className="h-64 rounded-2xl border-2 border-black overflow-hidden relative shadow-card">
        {pic.imageUrl ? (
          <img src={pic.imageUrl} alt={pic.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500" />
        )}
        <div className="absolute top-4 left-4"><PicStatusBadge status={isPassed ? 'passed' : pic.status} /></div>
        {/* Safety menu */}
        {!isOwner && (
          <button onClick={() => setShowSafety(true)} className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white" aria-label="More options">
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{pic.title}</h1>
          {pic.category && <Badge label={pic.category} color="brand" />}
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2"><Calendar size={15} className="text-brand" />{format(parseISO(pic.date), 'EEEE, MMMM d, yyyy')}</div>
          <div className="flex items-center gap-2"><Clock size={15} className="text-brand" />{pic.time}</div>
          <div className="flex items-center gap-2"><MapPin size={15} className="text-brand" />{pic.location}</div>
          <div className="flex items-center gap-2">
            <Users size={15} className="text-brand" />
            <span>{participantCount}/{pic.capacity} participants</span>
            {!isFull && !isPassed && <span className="text-green-600 font-medium">· {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} available</span>}
            {isFull && (
              <span className="text-red-500 font-medium">
                · Full{!isPassed && pic.status !== 'deactivated' ? ', but requests are open' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl p-5 shadow-card">
        <h2 className="font-semibold text-gray-900 mb-3">About this PIC</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{pic.description}</p>
      </div>

      {/* Host */}
      <div className="bg-white rounded-2xl p-5 shadow-card">
        <h2 className="font-semibold text-gray-900 mb-4">About the host</h2>
        <div className="flex items-start gap-4">
          <UserAvatar user={pic.creator} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{pic.creator.name}{pic.creator.age ? `, ${pic.creator.age}` : ''}</p>
            {pic.creator.location && <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><MapPin size={11} />{pic.creator.location}</p>}
            {pic.creator.bio && <p className="text-sm text-gray-600 leading-relaxed mb-3">{pic.creator.bio}</p>}
            {pic.creator.interests?.length > 0 && <InterestTags interests={pic.creator.interests} />}
          </div>
        </div>
      </div>

      {/* Participants */}
      {participantCount > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-3">Participants</h2>
          <div className="flex gap-3 flex-wrap">
            {pic.participants.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <UserAvatar user={p} size="sm" />
                <span className="text-sm text-gray-700">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety notice */}
      <div className="bg-yellow-200 border-2 border-black rounded-xl p-4 text-xs font-medium text-gray-950">
        <strong>Safety tip:</strong> Always meet in public places first. Trust your instincts.
      </div>

      {/* CTAs */}
      <div className="pb-4">
        {isOwner ? (
          <div className="space-y-3">
            {pendingRequests.length > 0 && (
              <div className="bg-primary-50 rounded-xl p-4 mb-2">
                <p className="text-sm font-semibold text-brand mb-1">{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}</p>
              </div>
            )}
            <div className="rounded-xl border-2 border-black bg-white p-4 space-y-3 shadow-[3px_3px_0px_#000]">
              <p className="text-sm font-semibold text-gray-900">Change event date</p>
              <div className="flex items-end gap-3">
                <Input
                  label="New date"
                  type="date"
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  value={dateDraft}
                  onChange={event => setDateDraft(event.target.value)}
                />
                <Button
                  onClick={handleSaveDate}
                  loading={dateLoading}
                  disabled={!dateDraft || dateDraft === pic.date}
                >
                  Save date
                </Button>
              </div>
            </div>
            <Button fullWidth onClick={() => setShowRequests(true)} variant="secondary">
              <Users size={16} /> View Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </Button>
            {['active', 'full'].includes(pic.status) && !isPassed && (
              <div className="rounded-xl border-2 border-black bg-white p-4 space-y-3 shadow-[3px_3px_0px_#000]">
                <p className="text-sm font-semibold text-gray-900">Add more seats</p>
                <p className="text-xs text-gray-500">Current capacity: {pic.capacity}. You can increase it up to 20.</p>
                <div className="flex items-end gap-3">
                  <Input
                    label="Additional seats"
                    type="number"
                    min={1}
                    max={20 - pic.capacity}
                    value={seatsToAdd}
                    onChange={event => setSeatsToAdd(Number(event.target.value))}
                    className="w-24"
                  />
                  <Button
                    onClick={handleAddSeats}
                    loading={capacityLoading}
                    disabled={seatsToAdd < 1 || pic.capacity + seatsToAdd > 20}
                  >
                    Add seats
                  </Button>
                </div>
              </div>
            )}
            {pic.participants.length > 0 && (
              <Button fullWidth onClick={handleOpenChat}><MessageCircle size={16} /> View Chats</Button>
            )}
            {['deactivated', 'passed'].includes(pic.status) && (
              <Button
                fullWidth
                onClick={handleActivate}
                loading={statusLoading}
                disabled={!dateDraft || isPast(parseISO(dateDraft)) || dateDraft !== pic.date}
              >
                Reactivate PIC
              </Button>
            )}
            {['active', 'full'].includes(pic.status) && (
              <Button fullWidth variant="outline" onClick={() => setShowDeactivate(true)}>Deactivate PIC</Button>
            )}
          </div>
        ) : isPassed ? (
          <Button fullWidth variant="outline" disabled>Event Passed</Button>
        ) : pic.status === 'deactivated' ? (
          <Button fullWidth variant="outline" disabled>PIC Deactivated</Button>
        ) : requestStatus === 'pending' ? (
          <Button fullWidth variant="secondary" disabled>✓ Request Sent</Button>
        ) : requestStatus === 'accepted' ? (
          <Button fullWidth onClick={handleOpenChat}><MessageCircle size={16} /> View Chats</Button>
        ) : (
          <Button fullWidth onClick={handleJoin} loading={requestLoading}>{isFull ? 'Request to Join' : 'Want to Join'}</Button>
        )}
      </div>

      {/* Deactivate modal */}
      <Modal open={showDeactivate} onClose={() => setShowDeactivate(false)} title="Deactivate this PIC?">
        <p className="text-sm text-gray-600 mb-6">Your PIC will no longer appear in Discover. Existing participants can still access the conversation.</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setShowDeactivate(false)}>Keep Active</Button>
          <Button variant="danger" fullWidth onClick={handleDeactivate} loading={statusLoading}>Deactivate PIC</Button>
        </div>
      </Modal>

      {/* Requests modal */}
      <Modal open={showRequests} onClose={() => setShowRequests(false)} title="Join Requests" size="lg">
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => (
              <JoinRequestCard
                key={req.id}
                request={req}
                currentUserInterests={currentUser?.interests ?? []}
                onAccept={() => handleAcceptRequest(req.id, req.requesterId)}
                onDecline={() => handleDeclineRequest(req.id)}
              />
            ))}
          </div>
        )}
      </Modal>

      {/* Safety modal */}
      <Modal open={showSafety} onClose={() => setShowSafety(false)} title="More options">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm text-gray-700 text-left transition-colors">
            <Flag size={16} className="text-gray-400" /> Report this PIC
          </button>
        </div>
      </Modal>
    </div>
  );
}
