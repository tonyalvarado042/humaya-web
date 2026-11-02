import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buttonClasses, Card, Tag } from '@/components/ui';
import { useGuestProfile, useInterviewProgress } from '@/hooks';
import { intlLocale, localizedText } from '@/i18n/localizedText';
import { shortDate, villaName } from '../format';
import { ProtocolTips } from '../home/ProtocolTips';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useCurrentStay } from '../layout/useCurrentStay';
import { useGuestLanguage } from '../layout/useGuestLanguage';

/**
 * El resumen que antes vivía en el Home (tarjeta de estadía + progreso de
 * entrevista + protocolo), ahora como su propia opción "Mis datos" — Anthony
 * pidió conservarlo después de que el Home pasó a ser la grilla de fichas.
 */
export function MyDataPage() {
  const { stayId } = useCurrentStay();
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const profile = useGuestProfile(stayId);
  const progress = useInterviewProgress(stayId);

  if (profile.isPending || progress.isPending) {
    return <ScreenLoading label={t('resumen.loading')} />;
  }

  if (profile.isError || progress.isError || !profile.data || !progress.data) {
    return (
      <ScreenError
        onRetry={() => {
          void profile.refetch();
          void progress.refetch();
        }}
      />
    );
  }

  const { stay, alerts } = profile.data;
  const villa = villaName(stay.villa);
  const celebration = alerts.find((alert) => alert.kind === 'celebration');
  const complete = progress.data.complete;
  const locale = intlLocale(language);

  return (
    <Screen>
      <ScreenHeading eyebrow={t('resumen.eyebrow')} title={t('resumen.title')} />

      <Card className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted">{t('resumen.checkIn')}</span>
            <span className="font-display text-2xl">{shortDate(stay.checkIn, locale)}</span>
            <span className="text-[13px] text-muted">{t('resumen.checkInTime')}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted">{t('resumen.checkOut')}</span>
            <span className="font-display text-2xl">{shortDate(stay.checkOut, locale)}</span>
            <span className="text-[13px] text-muted">{t('resumen.checkOutTime')}</span>
          </div>
        </div>

        <hr className="m-0 h-px border-0 bg-line" />

        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          <li className="rounded-pill bg-surface-raised px-3 py-1.5 text-[13px]">{villa}</li>
          <li className="rounded-pill bg-surface-raised px-3 py-1.5 text-[13px]">
            {t('resumen.people', { count: stay.partySize })}
          </li>
          {celebration ? (
            <li>
              <Tag tone="celebration">{localizedText(celebration.label, language)}</Tag>
            </li>
          ) : null}
        </ul>
      </Card>

      <Card variant="accent" className="flex flex-col gap-2.5">
        <span className="text-eyebrow text-gold">{t('resumen.interviewEyebrow')}</span>
        <h2 className="m-0 font-display text-[26px] leading-tight font-medium">
          {t('resumen.interviewTitle')}
        </h2>
        <p className="m-0 text-sm leading-relaxed text-muted">
          {complete
            ? t('resumen.interviewComplete')
            : t('resumen.interviewProgress', {
                answered: progress.data.answered,
                total: progress.data.total,
              })}
        </p>

        <div
          role="progressbar"
          aria-label={t('resumen.interviewTitle')}
          aria-valuemin={0}
          aria-valuemax={progress.data.total}
          aria-valuenow={progress.data.answered}
          aria-valuetext={t('resumen.progressValue', {
            answered: progress.data.answered,
            total: progress.data.total,
          })}
          className="h-1 overflow-hidden rounded-sm bg-gold-track"
        >
          <div
            className="h-1 bg-gold transition-[width]"
            style={{ width: `${(progress.data.answered / progress.data.total) * 100}%` }}
          />
        </div>

        <Link to="/app/interview" className={buttonClasses('primary', 'lg', 'mt-1.5')}>
          {complete ? t('resumen.interviewCtaComplete') : t('resumen.interviewCta')}
        </Link>
      </Card>

      <ProtocolTips stayId={stayId} prepDay={stay.prepDay} />
    </Screen>
  );
}
