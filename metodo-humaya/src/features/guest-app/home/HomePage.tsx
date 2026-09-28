import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HumayaLogo } from '@/components/HumayaLogo';
import { buttonClasses, Card, Tag } from '@/components/ui';
import { useGuestProfile, useInterviewProgress } from '@/hooks';
import { intlLocale, localizedText } from '@/i18n/localizedText';
import { daysUntil } from '@/services/clock';
import { firstName, shortDate, villaName } from '../format';
import { Screen, ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { useCurrentStay } from '../layout/useCurrentStay';
import { GuestPicker } from './GuestPicker';
import { LanguageSelector } from './LanguageSelector';
import { ProtocolTips } from './ProtocolTips';

export function HomePage() {
  const { stayId } = useCurrentStay();
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const profile = useGuestProfile(stayId);
  const progress = useInterviewProgress(stayId);

  if (profile.isPending || progress.isPending) {
    return <ScreenLoading label={t('home.loading')} />;
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

  const { guest, stay, alerts } = profile.data;
  const villa = villaName(stay.villa);
  const celebration = alerts.find((alert) => alert.kind === 'celebration');
  const complete = progress.data.complete;
  const days = daysUntil(stay.checkIn);
  const arrivalLine =
    days < 0
      ? t('home.inHouse', { villa })
      : days === 0
        ? t('home.arrivalToday', { villa })
        : days === 1
          ? t('home.arrivalTomorrow', { villa })
          : t('home.arrivalInDays', { count: days, villa });
  const locale = intlLocale(language);

  return (
    <Screen>
      <header className="flex items-center justify-between gap-3">
        <HumayaLogo className="w-20 shrink-0 min-[390px]:w-24" />
        <div className="flex items-end gap-2">
          <GuestPicker />
          <LanguageSelector />
        </div>
      </header>

      <section className="flex flex-col gap-1.5">
        <span className="text-eyebrow text-muted">{t('home.eyebrow')}</span>
        <h1 className="m-0 font-display text-[44px] leading-none font-medium">
          {t('home.greeting', { name: firstName(guest.fullName) })}
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-muted">{arrivalLine}</p>
      </section>

      <Card className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted">{t('home.checkIn')}</span>
            <span className="font-display text-2xl">{shortDate(stay.checkIn, locale)}</span>
            <span className="text-[13px] text-muted">{t('home.checkInTime')}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted">{t('home.checkOut')}</span>
            <span className="font-display text-2xl">{shortDate(stay.checkOut, locale)}</span>
            <span className="text-[13px] text-muted">{t('home.checkOutTime')}</span>
          </div>
        </div>

        <hr className="m-0 h-px border-0 bg-line" />

        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          <li className="rounded-pill bg-surface-raised px-3 py-1.5 text-[13px]">{villa}</li>
          <li className="rounded-pill bg-surface-raised px-3 py-1.5 text-[13px]">
            {t('home.people', { count: stay.partySize })}
          </li>
          {celebration ? (
            <li>
              <Tag tone="celebration">{localizedText(celebration.label, language)}</Tag>
            </li>
          ) : null}
        </ul>
      </Card>

      <Card variant="accent" className="flex flex-col gap-2.5">
        <span className="text-eyebrow text-gold">{t('home.interviewEyebrow')}</span>
        <h2 className="m-0 font-display text-[26px] leading-tight font-medium">
          {t('home.interviewTitle')}
        </h2>
        <p className="m-0 text-sm leading-relaxed text-muted">
          {complete
            ? t('home.interviewComplete')
            : t('home.interviewProgress', {
                answered: progress.data.answered,
                total: progress.data.total,
              })}
        </p>

        <div
          role="progressbar"
          aria-label={t('home.interviewTitle')}
          aria-valuemin={0}
          aria-valuemax={progress.data.total}
          aria-valuenow={progress.data.answered}
          aria-valuetext={t('home.progressValue', {
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
          {complete ? t('home.interviewCtaComplete') : t('home.interviewCta')}
        </Link>
      </Card>

      <ProtocolTips stayId={stayId} prepDay={stay.prepDay} />
    </Screen>
  );
}
