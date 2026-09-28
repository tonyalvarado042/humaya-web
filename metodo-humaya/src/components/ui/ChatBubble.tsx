import { cn } from './cn';

interface ChatBubbleProps {
  from: 'concierge' | 'guest';
  children: string;
}

/**
 * Mensaje del chat. El contenido se renderiza como texto plano a propósito:
 * ARCHITECTURE.md prohíbe dangerouslySetInnerHTML en los mensajes.
 */
export function ChatBubble({ from, children }: ChatBubbleProps) {
  const isConcierge = from === 'concierge';

  return (
    <p
      className={cn(
        'm-0 px-4 py-3 text-[15px] leading-relaxed',
        isConcierge
          ? 'max-w-[300px] self-start rounded-bubble rounded-bl-sm border border-line bg-surface text-text'
          : 'max-w-[260px] self-end rounded-bubble rounded-br-sm bg-gold font-medium text-on-gold',
      )}
    >
      {children}
    </p>
  );
}
