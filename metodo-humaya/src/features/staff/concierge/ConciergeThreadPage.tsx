import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ChatBubble, Chip, EmptyState, IconButton, Input } from '@/components/ui';
import {
  useConciergeMessages,
  useMarkConversationRead,
  useRespuestasGuardadas,
  useSendStaffReply,
} from '@/hooks';
import { DEMO_STAYS } from '@/mocks';
import { Screen, ScreenError, ScreenLoading } from '../layout/ScreenState';
import { conciergeThreadCopy as copy } from './copy';
import { PanelHuesped } from './PanelHuesped';

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
  const [draftEn, setDraftEn] = useState('');
  const demoStay = DEMO_STAYS.find((stay) => stay.stayId === stayId);
  const messages = useConciergeMessages(stayId ?? '');
  const markRead = useMarkConversationRead(stayId ?? '');
  const sendReply = useSendStaffReply(stayId ?? '');
  // Solo las encendidas: en el hilo no sirve ofrecer una respuesta apagada.
  const respuestas = useRespuestasGuardadas(true);

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
    sendReply.mutate({ text: clean, textEn: draftEn.trim() || undefined });
    setDraft('');
    setDraftEn('');
  }

  return (
    <Screen>
      <Link to="/staff/concierge" className="text-sm text-gold no-underline">
        {copy.back}
      </Link>

      <h1 className="m-0 font-display text-[28px] font-medium lg:text-[32px]">
        {demoStay.guestName}
      </h1>

      {/*
        La ficha y el chat, lado a lado.

        En escritorio la ficha queda fija a la derecha: el que contesta tiene
        que poder leer las alergias y lo que el huésped ya nos dijo MIENTRAS
        escribe, no antes de empezar a bajar. En móvil va arriba, porque el
        contexto se lee primero y el chat empieza debajo — y por eso todo lo
        que no es urgente va plegado: en un teléfono, cada línea de más es
        una línea que separa a alguien de la conversación que vino a leer.
      */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <aside className="order-1 flex flex-col gap-5 lg:sticky lg:top-6 lg:order-2 lg:w-96 lg:shrink-0">
          <PanelHuesped stayId={stayId} messages={messages.data} />
        </aside>

        <div className="order-2 flex min-w-0 flex-1 flex-col gap-5 lg:order-1">
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
              <div className="flex flex-col gap-1">
                <p className="m-0 text-sm text-muted">{copy.empty}</p>
                <p className="m-0 text-[13px] text-muted-soft">{copy.emptyPorQue}</p>
              </div>
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

          {respuestas.data && respuestas.data.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-soft">
                {copy.guardadas}
              </span>
              <div className="flex flex-wrap gap-2">
                {respuestas.data.map((respuesta) => (
                  <Chip
                    key={respuesta.id}
                    title={respuesta.texto}
                    onClick={() => {
                      setDraft(respuesta.texto);
                      setDraftEn(respuesta.textoEn ?? '');
                    }}
                  >
                    {respuesta.titulo}
                  </Chip>
                ))}
              </div>
              {/* Pone el texto en el cuadro, no lo manda: el huesped merece que
              alguien lo lea antes de enviarlo, y casi siempre hay que
              ajustarle una palabra. */}
              <span className="text-[13px] text-muted-soft">{copy.guardadasAyuda}</span>
            </div>
          ) : null}

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <Input
              label={copy.replyLabel}
              placeholder={copy.replyPlaceholder}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Input
              label={copy.replyLabelEn}
              placeholder={copy.replyPlaceholderEn}
              value={draftEn}
              onChange={(event) => setDraftEn(event.target.value)}
            />

            {/* Como le llega. 53 de 62 reservas entran por OTAs, asi que el
            huesped promedio lee en ingles: si el campo en ingles esta vacio,
            la pantalla lo dice ANTES de mandar, no despues. */}
            {draft.trim() ? (
              <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-soft">
                  {copy.vistaPrevia}
                </span>
                <span className="text-[13px] text-muted">{copy.siLeeEspanol}</span>
                <ChatBubble from="staff">{draft}</ChatBubble>
                <span className="text-[13px] text-muted">{copy.siLeeIngles}</span>
                <ChatBubble from="staff">{draftEn.trim() || draft}</ChatBubble>
                {!draftEn.trim() ? (
                  <p role="status" className="m-0 text-[13px] text-on-alert">
                    {copy.sinIngles}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <IconButton
                type="submit"
                aria-label={sendReply.isPending ? copy.sending : copy.send}
                size="lg"
                disabled={!draft.trim() || sendReply.isPending}
              >
                <Send size={20} strokeWidth={1.8} aria-hidden="true" />
              </IconButton>
              <span className="text-[13px] text-muted-soft">
                {sendReply.isPending ? copy.sending : copy.send}
              </span>
            </div>
          </form>
        </div>
      </div>
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
