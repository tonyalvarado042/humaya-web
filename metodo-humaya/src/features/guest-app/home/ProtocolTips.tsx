import { EmptyState, Skeleton } from '@/components/ui';
import { useProtocolTips } from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import { useTranslation } from 'react-i18next';
import { useGuestLanguage } from '../layout/useGuestLanguage';

interface ProtocolTipsProps {
  stayId: string;
  prepDay?: number;
}

/** La sección "Preparate": los consejos del día del protocolo de 7 días. */
export function ProtocolTips({ stayId, prepDay }: ProtocolTipsProps) {
  const { t } = useTranslation();
  const { language } = useGuestLanguage();
  const tips = useProtocolTips(stayId);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 font-display text-2xl font-medium">{t('home.protocolTitle')}</h2>
        {prepDay ? (
          <span className="text-[13px] text-muted">{t('home.protocolDay', { day: prepDay })}</span>
        ) : null}
      </div>

      {tips.isPending ? (
        <>
          <span aria-live="polite" className="sr-only">
            {t('common.loading', { label: t('home.protocolLoading') })}
          </span>
          <Skeleton variant="line" />
          <Skeleton variant="line" className="w-2/3" />
        </>
      ) : null}

      {tips.isError ? (
        <p role="alert" className="m-0 text-sm text-muted">
          {t('home.protocolError')}
        </p>
      ) : null}

      {tips.data?.length === 0 ? (
        <EmptyState
          title={t('home.protocolEmptyTitle')}
          description={t('home.protocolEmptyBody')}
        />
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
        {tips.data?.map((tip) => (
          <li key={`${tip.day}-${tip.order}`} className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-pill border border-line-strong text-[13px] text-gold"
            >
              {tip.order}
            </span>
            <div>
              <p className="m-0 text-[15px] font-medium">{localizedText(tip.title, language)}</p>
              <p className="m-0 text-sm leading-snug text-muted">
                {localizedText(tip.body, language)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
