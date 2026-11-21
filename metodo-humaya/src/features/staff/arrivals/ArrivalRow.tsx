import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Tag } from '@/components/ui';
import { useConciergeConversations } from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import type { Arrival } from '@/types';
import { useIdiomaRecepcion } from '../puerta/contexto';
import { demoCopy } from './copyDemo';

/** El Badge del estado de la entrevista, igual en la tabla y en las tarjetas. */
export function InterviewBadge({ interview }: { interview: Arrival['interview'] }) {
  const [idioma] = useIdiomaRecepcion();
  const copy = demoCopy[idioma];
  if (interview.complete) return <Badge tone="success">{copy.interviewComplete}</Badge>;
  if (interview.answered === 0) return <Badge tone="neutral">{copy.interviewPending}</Badge>;
  return (
    <Badge tone="warning">{copy.interviewInProgress(interview.answered, interview.total)}</Badge>
  );
}

/** Las alertas del huésped. La de alergia ya lleva ícono además del color. */
export function AlertTags({ alerts }: { alerts: Arrival['alerts'] }) {
  const [idioma] = useIdiomaRecepcion();
  if (alerts.length === 0) return null;

  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {alerts.map((alert) => (
        <li key={alert.label.es}>
          <Tag
            tone={
              alert.kind === 'allergy'
                ? 'alert'
                : alert.kind === 'celebration'
                  ? 'celebration'
                  : 'info'
            }
          >
            {localizedText(alert.label, idioma)}
          </Tag>
        </li>
      ))}
    </ul>
  );
}

/** Aviso de que ese huésped le escribió al Concierge y sigue sin leerse. */
export function ConciergeIndicator({ stayId }: { stayId: string }) {
  const [idioma] = useIdiomaRecepcion();
  const copy = demoCopy[idioma];
  const conversations = useConciergeConversations();
  const conversation = (conversations.data ?? []).find((item) => item.stayId === stayId);

  if (!conversation || conversation.unreadCount === 0) return null;

  return (
    <Link
      to={`/staff/concierge/${stayId}`}
      className="inline-flex items-center gap-1 no-underline"
      title={copy.conciergeUnread(conversation.unreadCount)}
    >
      <Badge tone="warning">
        <MessageCircle size={13} strokeWidth={2} aria-hidden="true" className="mr-1 inline" />
        {conversation.unreadCount}
      </Badge>
    </Link>
  );
}

export function ProfileLink({ stayId }: { stayId: string }) {
  const [idioma] = useIdiomaRecepcion();
  const copy = demoCopy[idioma];
  return (
    <Link
      to={`/staff/guests/${stayId}`}
      className="inline-flex min-h-11 items-center text-sm font-medium text-gold"
    >
      {copy.seeProfile}
    </Link>
  );
}
