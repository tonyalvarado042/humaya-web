import { Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubble, Chip, IconButton, Input } from '@/components/ui';
import { useConciergeMessages, useConciergeSuggestions, useSendMessage } from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import { ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';

export function ConciergePage() {
  const [draft, setDraft] = useState('');
  const { t } = useTranslation();
  const { language } = useGuestLanguage();
  const messages = useConciergeMessages();
  const suggestions = useConciergeSuggestions();
  const sendMessage = useSendMessage();

  function send(text: string) {
    const clean = text.trim();
    if (!clean || sendMessage.isPending) return;
    sendMessage.mutate(clean);
    setDraft('');
  }

  if (messages.isPending) {
    return <ScreenLoading label={t('concierge.loading')} />;
  }

  if (messages.isError || !messages.data) {
    return <ScreenError onRetry={() => void messages.refetch()} />;
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-3.5 border-b border-line-soft px-5 pt-6 pb-3.5">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-pill border border-gold-dim text-gold"
        >
          <Sparkles size={22} strokeWidth={1.6} />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 font-display text-[28px] leading-none font-medium">
            {t('concierge.title')}
          </h1>
          <p className="m-0 text-[13px] text-muted">{t('concierge.subtitle')}</p>
        </div>
      </header>

      {/* role="log" es el rol de una transcripción de chat: los mensajes nuevos
          se anuncian sin robarle el foco a quien escribe. */}
      <div
        role="log"
        aria-live="polite"
        aria-label={t('concierge.thread')}
        className="flex flex-col gap-3 px-5 py-4.5"
      >
        {messages.data.map((message) => (
          <ChatBubble key={message.id} from={message.from}>
            {message.translations ? localizedText(message.translations, language) : message.text}
          </ChatBubble>
        ))}
        {sendMessage.isPending ? (
          <p className="m-0 self-start text-[13px] text-muted-soft">{t('concierge.sending')}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-line-soft py-3">
        <div
          role="group"
          aria-label={t('concierge.suggestions')}
          className="flex gap-2 overflow-x-auto px-5 pb-1"
        >
          {suggestions.map((suggestion) => {
            const label = localizedText(suggestion, language);
            return (
              <Chip
                key={suggestion.es}
                className="shrink-0 whitespace-nowrap"
                disabled={sendMessage.isPending}
                onClick={() => send(label)}
              >
                {label}
              </Chip>
            );
          })}
        </div>

        {sendMessage.isError ? (
          <p role="alert" className="m-0 px-5 text-sm text-on-alert">
            {t('concierge.error')}
          </p>
        ) : null}

        <form
          className="flex items-end gap-2 px-5"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <div className="flex-1">
            <Input
              label={t('concierge.inputLabel')}
              hideLabel
              placeholder={t('concierge.placeholder')}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          <IconButton
            type="submit"
            aria-label={t('concierge.send')}
            size="lg"
            disabled={!draft.trim()}
          >
            <Send size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
        </form>
      </div>
    </div>
  );
}
