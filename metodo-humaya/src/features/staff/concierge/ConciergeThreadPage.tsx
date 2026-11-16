import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ChatBubble, EmptyState, IconButton, Input } from '@/components/ui';
import { useConciergeMessages, useMarkConversationRead, useSendStaffReply } from '@/hooks';
import { DEMO_STAYS } from '@/mocks';
import { Screen, ScreenError, ScreenLoading } from '../layout/ScreenState';
import { conciergeThreadCopy as copy } from './copy';

function messageAt(iso: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Costa_Rica',
  }).format(new Date(iso));
}

/** Hilo completo de un huésped, con respuesta del staff. */
export function ConciergeThreadPage() {
  const { stayId } = useParams<{ stayId: string }>();
  const [draft, setDraft] = useState('');
  const demoStay = DEMO_STAYS.find((stay) => stay.stayId === stayId);
  const messages = useConciergeMessages(stayId ?? '');
  const markRead = useMarkConversationRead(stayId ?? '');
  const sendReply = useSendStaffReply(stayId ?? '');

  useEffect(() => {
    if (stayId && demoStay) markRead.mutate();
    // Solo al entrar a esta conversación, no en cada cambio de la mutación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stayId]);

  if (!stayId || !demoStay) {
    return (
      <Screen>
        <NotFound />
      </Screen>
    );
  }

  if (messages.isPending) {
    return <ScreenLoading label={copy.loading} />;
  }

  if (messages.isError || !messages.data) {
    return <ScreenError onRetry={() => void messages.refetch()} />;
  }

  function send() {
    const clean = draft.trim();
    if (!clean || sendReply.isPending) return;
    sendReply.mutate(clean);
    setDraft('');
  }

  return (
    <Screen>
      <Link to="/staff/concierge" className="text-sm text-gold no-underline">
        {copy.back}
      </Link>

      <h1 className="m-0 font-display text-[28px] font-medium lg:text-[32px]">
        {demoStay.guestName}
      </h1>

      {messages.data.some((message) => message.from === 'concierge' && message.escalated) ? (
        <p role="status" className="m-0 text-sm text-on-alert">
          {copy.escalatedNotice}
        </p>
      ) : null}

      <div
        role="log"
        aria-label={copy.thread(demoStay.guestName)}
        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4.5"
      >
        {messages.data.length === 0 ? (
          <p className="m-0 text-sm text-muted">{copy.empty}</p>
        ) : (
          messages.data.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <ChatBubble from={message.from}>{message.text}</ChatBubble>
              <span
                className={
                  message.from === 'guest'
                    ? 'self-end text-xs text-muted-soft'
                    : 'self-start text-xs text-muted-soft'
                }
              >
                {messageAt(message.at)}
              </span>
            </div>
          ))
        )}
      </div>

      {sendReply.isError ? (
        <p role="alert" className="m-0 text-sm text-on-alert">
          {copy.error}
        </p>
      ) : null}

      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <div className="flex-1">
          <Input
            label={copy.replyLabel}
            hideLabel
            placeholder={copy.replyPlaceholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <IconButton
          type="submit"
          aria-label={sendReply.isPending ? copy.sending : copy.send}
          size="lg"
          disabled={!draft.trim() || sendReply.isPending}
        >
          <Send size={20} strokeWidth={1.8} aria-hidden="true" />
        </IconButton>
      </form>
    </Screen>
  );
}

function NotFound() {
  return (
    <EmptyState
      title={copy.notFoundTitle}
      description={copy.notFoundBody}
      action={
        <Link to="/staff/concierge" className="text-sm text-gold">
          {copy.back}
        </Link>
      }
    />
  );
}
