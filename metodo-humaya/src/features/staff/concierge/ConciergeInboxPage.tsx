import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Card, Tag } from '@/components/ui';
import { useConciergeConversations } from '@/hooks';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { conciergeInboxCopy as copy } from './copy';

function lastMessageAt(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Costa_Rica',
  }).format(new Date(iso));
}

/** Bandeja del Concierge: una fila por huésped, con lo último que preguntó. */
export function ConciergeInboxPage() {
  const conversations = useConciergeConversations();

  if (conversations.isPending) {
    return <ScreenLoading label={copy.loading} />;
  }

  if (conversations.isError || !conversations.data) {
    return <ScreenError onRetry={() => void conversations.refetch()} />;
  }

  return (
    <Screen>
      <ScreenHeading eyebrow="Recepción" title={copy.title} />

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {conversations.data.map((conversation) => (
          <li key={conversation.stayId}>
            <Link to={`/staff/concierge/${conversation.stayId}`} className="block no-underline">
              <Card className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <MessageCircle size={18} strokeWidth={1.6} className="shrink-0 text-gold" />
                    <span className="truncate font-medium text-text">{conversation.guestName}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {conversation.escalated ? <Tag tone="alert">{copy.escalated}</Tag> : null}
                    {conversation.unreadCount > 0 ? (
                      <Badge tone="warning">{copy.unread(conversation.unreadCount)}</Badge>
                    ) : null}
                  </div>
                </div>

                {conversation.lastGuestMessage ? (
                  <p className="m-0 truncate text-sm text-muted">
                    {conversation.lastGuestMessage.text}
                    <span className="ml-2 text-xs text-muted-soft">
                      · {lastMessageAt(conversation.lastGuestMessage.at)}
                    </span>
                  </p>
                ) : (
                  <p className="m-0 text-sm text-muted-soft">{copy.emptyLast}</p>
                )}
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
