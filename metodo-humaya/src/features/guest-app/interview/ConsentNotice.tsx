import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface ConsentNoticeProps {
  onAccept: () => void;
  onSkip: () => void;
  pending: boolean;
}

/**
 * Consentimiento antes de la primera pregunta sensible (Ley 8968): explica para
 * qué se usa el dato y deja saltarla sin costo.
 */
export function ConsentNotice({ onAccept, onSkip, pending }: ConsentNoticeProps) {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="consent-title"
      className="flex flex-col gap-3 rounded-card border border-gold-dim bg-surface-sunken p-4"
    >
      <h2 id="consent-title" className="m-0 font-display text-xl font-medium">
        {t('interview.consentTitle')}
      </h2>
      <p className="m-0 text-sm leading-relaxed text-muted">{t('interview.consentBody')}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onAccept} disabled={pending}>
          {t('interview.consentAccept')}
        </Button>
        <Button variant="outline" onClick={onSkip}>
          {t('interview.consentSkip')}
        </Button>
      </div>
    </section>
  );
}
