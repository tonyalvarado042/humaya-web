import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buttonClasses, Card, EmptyState } from '@/components/ui';
import { useWeeklyProgram } from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { estimateSessionMinutes } from './estimate';

/** Lista semanal del pilar Move: una tarjeta por sesión, con acceso al reproductor. */
export function MovePage() {
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const program = useWeeklyProgram();

  if (program.isPending) {
    return <ScreenLoading label={t('move.loading')} />;
  }

  if (program.isError || !program.data) {
    return <ScreenError onRetry={() => void program.refetch()} />;
  }

  const { coachName, sessions } = program.data;

  return (
    <Screen>
      <ScreenHeading
        eyebrow={t('move.eyebrow')}
        title={t('move.title')}
        description={`${t('move.subtitle')} ${t('move.coach', { name: coachName })}`}
      />

      {sessions.length === 0 ? (
        <EmptyState title={t('move.emptyTitle')} description={t('move.emptyBody')} />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Card key={session.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted">
                    {t('move.dayLabel', { day: session.dayIndex + 1 })}
                  </span>
                  <h2 className="m-0 font-display text-2xl font-medium">
                    {localizedText(session.focus, language)}
                  </h2>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {t('move.sessionDuration', { minutes: estimateSessionMinutes(session) })}
                </span>
              </div>

              <p className="m-0 text-sm leading-relaxed text-muted">
                {localizedText(session.blurb, language)}
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted">
                  {t('move.sessionSections', { count: session.sections.length })}
                </span>
                <Link to={`/app/move/${session.id}`} className={buttonClasses('primary', 'md')}>
                  {t('move.startSession')}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
