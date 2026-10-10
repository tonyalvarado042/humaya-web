import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HumayaLogo } from '@/components/HumayaLogo';
import { Card } from '@/components/ui';
import { useAdminOpciones, useGuestProfile, useInterviewProgress } from '@/hooks';
import { daysUntil } from '@/services/clock';
import { firstName, villaName } from '../format';
import { OPCION_ICONS } from '../icons';
import { Screen, ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useCurrentStay } from '../layout/useCurrentStay';
import { GuestPicker } from './GuestPicker';
import { LanguageSelector } from './LanguageSelector';

/**
 * Las fichas son las opciones de humaya_admin_opciones (la misma fuente que
 * filtra el menú de abajo en GuestLayout): lo que el admin deshabilita ahí
 * tampoco aparece acá.
 */
export function HomePage() {
  const { stayId } = useCurrentStay();
  const { t } = useTranslation();
  const profile = useGuestProfile(stayId);
  const progress = useInterviewProgress(stayId);
  const opciones = useAdminOpciones(true);

  if (profile.isPending || progress.isPending || opciones.isPending) {
    return <ScreenLoading label={t('home.loading')} />;
  }

  if (
    profile.isError ||
    progress.isError ||
    opciones.isError ||
    !profile.data ||
    !progress.data ||
    !opciones.data
  ) {
    return (
      <ScreenError
        onRetry={() => {
          void profile.refetch();
          void progress.refetch();
          void opciones.refetch();
        }}
      />
    );
  }

  const { guest, stay } = profile.data;
  const villa = villaName(stay.villa);
  const days = daysUntil(stay.checkIn);
  const arrivalLine =
    days < 0
      ? t('home.inHouse', { villa })
      : days === 0
        ? t('home.arrivalToday', { villa })
        : days === 1
          ? t('home.arrivalTomorrow', { villa })
          : t('home.arrivalInDays', { count: days, villa });

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

      <nav aria-label={t('home.quickAccessLabel')} className="grid grid-cols-2 gap-3">
        {opciones.data.map((opcion) => {
          const Icon = (opcion.icono && OPCION_ICONS[opcion.icono]) || null;
          const isInterview = opcion.clave === 'interview';

          return (
            <Link key={opcion.id} to={`/app/${opcion.clave}`} className="no-underline">
              <Card className="flex h-full flex-col gap-2.5">
                {Icon ? (
                  <Icon size={26} strokeWidth={1.6} className="text-gold" aria-hidden="true" />
                ) : null}
                <span className="font-display text-xl leading-tight font-medium text-text">
                  {t(`nav.${opcion.clave}`, opcion.etiqueta)}
                </span>
                {opcion.descripcion ? (
                  <p className="m-0 text-[13px] leading-relaxed text-muted">{opcion.descripcion}</p>
                ) : null}
                {isInterview ? (
                  <span className="mt-auto text-xs font-medium text-gold">
                    {progress.data.complete
                      ? t('home.interviewDoneShort')
                      : t('home.interviewProgressShort', {
                          answered: progress.data.answered,
                          total: progress.data.total,
                        })}
                  </span>
                ) : null}
              </Card>
            </Link>
          );
        })}
      </nav>
    </Screen>
  );
}
