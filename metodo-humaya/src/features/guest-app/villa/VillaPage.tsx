import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Accordion, buttonClasses, Card } from '@/components/ui';
import { useVillaInfo } from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { useCurrentStay } from '../layout/useCurrentStay';

export function VillaPage() {
  const { stayId } = useCurrentStay();
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const villa = useVillaInfo(stayId);

  if (villa.isPending) {
    return <ScreenLoading label={t('villa.loading')} />;
  }

  if (villa.isError || !villa.data) {
    return <ScreenError onRetry={() => void villa.refetch()} />;
  }

  const info = villa.data;
  const photoAlt = t('villa.photoAlt', { villa: info.name });

  return (
    <Screen>
      <ScreenHeading
        eyebrow={t('villa.eyebrow')}
        title={info.name}
        description={info.highlights.map((item) => localizedText(item, language)).join(' · ')}
      />

      <img
        src="/villa-02.jpg"
        alt={photoAlt}
        width={1150}
        height={1340}
        className="aspect-4/3 w-full rounded-card object-cover object-center"
      />

      <Card>
        <dl className="m-0 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-muted">{t('villa.wifiNetwork')}</dt>
            <dd className="m-0 text-[15px] font-medium">{info.wifiNetwork}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t('villa.wifiPassword')}</dt>
            <dd className="m-0 text-[15px] font-medium">{info.wifiPassword}</dd>
          </div>
        </dl>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 font-display text-2xl font-medium">{t('villa.guidesTitle')}</h2>
        <Accordion
          items={info.guides.map((guide) => ({
            id: guide.id,
            title: localizedText(guide.title, language),
            body: localizedText(guide.body, language),
          }))}
        />
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <a href="#mapa" className={buttonClasses('outline', 'md')}>
          {t('villa.map')}
        </a>
        <Link to="/app/concierge" className={buttonClasses('primary', 'md')}>
          {t('villa.help')}
        </Link>
      </div>
    </Screen>
  );
}
