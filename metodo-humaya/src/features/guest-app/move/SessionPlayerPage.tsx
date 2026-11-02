import { Pause, Play, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Chip, IconButton, ProgressSegments } from '@/components/ui';
import { useWorkoutSession } from '@/hooks';
import { localizedText } from '@/i18n/localizedText';
import type { WorkoutExercise, WorkoutSession } from '@/types';
import { Screen, ScreenError, ScreenHeading, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { estimateSessionMinutes } from './estimate';
import { VideoStage } from './player/VideoStage';
import { VideoStylePicker } from './player/VideoStylePicker';
import { VIDEO_SRC } from './player/videoSrc';
import type { VideoStyle } from './player/types';

type Phase = 'intro' | 'section' | 'work' | 'rest' | 'closing' | 'cooldown' | 'summary';
type Rating = 'low' | 'mid' | 'high';

function totalExerciseCount(session: WorkoutSession): number {
  return session.sections.reduce((sum, section) => sum + section.exercises.length, 0);
}

function exerciseOrdinal(
  session: WorkoutSession,
  sectionIndex: number,
  exerciseIndex: number,
): number {
  let count = 0;
  for (let index = 0; index < sectionIndex; index += 1) {
    count += session.sections[index].exercises.length;
  }
  return count + exerciseIndex;
}

interface TopBarProps {
  exitLabel: string;
  onExit: () => void;
}

function PlayerTopBar({ exitLabel, onExit }: TopBarProps) {
  return (
    <div className="flex items-center justify-end">
      <IconButton aria-label={exitLabel} variant="outline" onClick={onExit}>
        <X size={18} strokeWidth={1.8} aria-hidden="true" />
      </IconButton>
    </div>
  );
}

/**
 * Reproductor de una sesión del pilar Move: intro de sesión (silenciable) →
 * intro de cada sección (ejercicios y repeticiones) → ejercicios con series de
 * trabajo/descanso → video de cierre al completar la tanda de cada ejercicio →
 * enfriamiento → resumen con calificación. El estilo de video es elegible en
 * cualquier momento entre los cuatro tratamientos del prototipo.
 */
export function SessionPlayerPage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const { t } = useTranslation();
  const { language } = useGuestLanguage();
  const navigate = useNavigate();
  const session = useWorkoutSession(sessionId);
  const data = session.data;

  const [phase, setPhase] = useState<Phase>('intro');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('takeover');
  const [rating, setRating] = useState<Rating | null>(null);

  const currentExercise: WorkoutExercise | undefined = data
    ? data.sections[sectionIndex]?.exercises[exerciseIndex]
    : undefined;

  const advanceFromWork = useCallback(() => {
    if (!currentExercise) return;
    if (setIndex + 1 < currentExercise.sets) {
      setSetIndex((value) => value + 1);
      setPhase('rest');
      setSecondsLeft(currentExercise.restSeconds);
    } else {
      setPhase('closing');
    }
  }, [currentExercise, setIndex]);

  const advanceFromRest = useCallback(() => {
    if (!currentExercise) return;
    setPhase('work');
    setSecondsLeft(currentExercise.workSeconds);
  }, [currentExercise]);

  const advanceFromClosing = useCallback(() => {
    if (!data) return;
    const section = data.sections[sectionIndex];
    const lastExerciseInSection = exerciseIndex === section.exercises.length - 1;
    const lastSection = sectionIndex === data.sections.length - 1;

    if (lastExerciseInSection && lastSection) {
      setPhase('cooldown');
      return;
    }

    if (lastExerciseInSection) {
      setSectionIndex((value) => value + 1);
      setExerciseIndex(0);
      setSetIndex(0);
      setPhase('section');
      return;
    }

    const nextExercise = section.exercises[exerciseIndex + 1];
    setExerciseIndex((value) => value + 1);
    setSetIndex(0);
    setSecondsLeft(nextExercise.workSeconds);
    setPhase('work');
  }, [data, sectionIndex, exerciseIndex]);

  useEffect(() => {
    if (phase !== 'work' && phase !== 'rest') return undefined;
    if (paused) return undefined;

    const id = window.setTimeout(() => {
      if (secondsLeft <= 0) {
        if (phase === 'work') advanceFromWork();
        else advanceFromRest();
      } else {
        setSecondsLeft((value) => value - 1);
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [phase, paused, secondsLeft, advanceFromWork, advanceFromRest]);

  if (session.isPending) {
    return <ScreenLoading label={t('move.loadingSession')} />;
  }

  if (session.isError || !data) {
    return (
      <ScreenError
        title={t('move.sessionErrorTitle')}
        description={t('move.sessionNotFound')}
        onRetry={() => void session.refetch()}
      />
    );
  }

  const totalExercises = totalExerciseCount(data);
  const completedExercises = exerciseOrdinal(data, sectionIndex, exerciseIndex);
  const exitToList = () => navigate('/app/move');

  function startSession() {
    setPhase('section');
  }

  function startSectionExercises() {
    if (!data) return;
    const section = data.sections[sectionIndex];
    const first = section.exercises[0];
    if (!first) return;
    setExerciseIndex(0);
    setSetIndex(0);
    setSecondsLeft(first.workSeconds);
    setPhase('work');
  }

  function skipCurrentTimer() {
    if (phase === 'work') advanceFromWork();
    else if (phase === 'rest') advanceFromRest();
  }

  function finishCooldown() {
    setPhase('summary');
  }

  return (
    <Screen>
      {phase !== 'summary' ? (
        <VideoStylePicker value={videoStyle} onChange={setVideoStyle} />
      ) : null}

      {phase === 'intro' ? (
        <VideoStage src={VIDEO_SRC.intro} style={videoStyle}>
          <PlayerTopBar exitLabel={t('move.player.exit')} onExit={exitToList} />
          <div className="flex flex-1 flex-col justify-end gap-3">
            <span className="text-eyebrow text-gold">{t('move.player.introTitle')}</span>
            <h1 className="m-0 font-display text-4xl leading-none font-medium">
              {localizedText(data.focus, language)}
            </h1>
            <p className="m-0 text-sm leading-relaxed opacity-90">
              {localizedText(data.blurb, language)}
            </p>
            <Button size="lg" onClick={startSession}>
              {t('move.startSession')}
            </Button>
          </div>
        </VideoStage>
      ) : null}

      {phase === 'section' ? (
        <VideoStage src={VIDEO_SRC.section} style={videoStyle}>
          <PlayerTopBar exitLabel={t('move.player.exit')} onExit={exitToList} />
          <ProgressSegments
            total={totalExercises}
            completed={completedExercises}
            label={t('move.player.exerciseProgress', {
              current: completedExercises + 1,
              total: totalExercises,
            })}
          />
          <div className="flex flex-col gap-2">
            <span className="text-eyebrow text-gold">{t('move.player.sectionTitle')}</span>
            <h2 className="m-0 font-display text-3xl font-medium">
              {localizedText(data.sections[sectionIndex].name, language)}
            </h2>
            <p className="m-0 text-sm opacity-90">
              {localizedText(data.sections[sectionIndex].cue, language)}
            </p>
          </div>
          <Card className="flex flex-col gap-3">
            <span className="text-xs text-muted">{t('move.player.sectionExercises')}</span>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {data.sections[sectionIndex].exercises.map((exercise) => (
                <li key={exercise.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{localizedText(exercise.name, language)}</span>
                  <span className="shrink-0 text-muted">
                    {t('move.player.sets', { count: exercise.sets })} ·{' '}
                    {typeof exercise.reps === 'number'
                      ? t('move.player.reps', { reps: exercise.reps })
                      : localizedText(exercise.reps, language)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Button size="lg" onClick={startSectionExercises}>
            {t('move.startSession')}
          </Button>
        </VideoStage>
      ) : null}

      {(phase === 'work' || phase === 'rest') && currentExercise ? (
        <VideoStage src={VIDEO_SRC.exercise} style={videoStyle}>
          <PlayerTopBar exitLabel={t('move.player.exit')} onExit={exitToList} />
          <ProgressSegments
            total={totalExercises}
            completed={completedExercises}
            label={t('move.player.exerciseProgress', {
              current: completedExercises + 1,
              total: totalExercises,
            })}
          />
          <div className="flex flex-col gap-1">
            <span className="text-eyebrow text-gold">
              {localizedText(data.sections[sectionIndex].name, language)}
            </span>
            <h2 className="m-0 font-display text-3xl font-medium">
              {localizedText(currentExercise.name, language)}
            </h2>
            <p className="m-0 text-sm opacity-90">{localizedText(currentExercise.cue, language)}</p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <span className="text-xs tracking-wide uppercase opacity-75">
              {phase === 'work' ? t('move.player.work') : t('move.player.rest')}
            </span>
            <span aria-live="polite" className="font-display text-7xl font-medium tabular-nums">
              {secondsLeft}
            </span>
            <span className="text-sm opacity-80">
              {t('move.player.setProgress', { current: setIndex + 1, total: currentExercise.sets })}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <IconButton
              aria-label={paused ? t('move.player.resume') : t('move.player.pause')}
              variant="outline"
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? (
                <Play size={20} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Pause size={20} strokeWidth={1.8} aria-hidden="true" />
              )}
            </IconButton>
            <Button variant="outline" onClick={skipCurrentTimer}>
              {t('move.player.skip')}
            </Button>
          </div>
        </VideoStage>
      ) : null}

      {phase === 'closing' && currentExercise ? (
        <VideoStage src={VIDEO_SRC.closing} style={videoStyle}>
          <PlayerTopBar exitLabel={t('move.player.exit')} onExit={exitToList} />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="text-eyebrow text-gold">{t('move.player.closingTitle')}</span>
            <h2 className="m-0 font-display text-3xl font-medium">
              {localizedText(currentExercise.name, language)}
            </h2>
            <Button size="lg" onClick={advanceFromClosing}>
              {t('move.player.next')}
            </Button>
          </div>
        </VideoStage>
      ) : null}

      {phase === 'cooldown' ? (
        <VideoStage src={VIDEO_SRC.cooldown} style={videoStyle}>
          <PlayerTopBar exitLabel={t('move.player.exit')} onExit={exitToList} />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="text-eyebrow text-gold">{t('move.player.cooldownTitle')}</span>
            <Button size="lg" onClick={finishCooldown}>
              {t('move.player.finish')}
            </Button>
          </div>
        </VideoStage>
      ) : null}

      {phase === 'summary' ? (
        <>
          <ScreenHeading
            eyebrow={t('move.eyebrow')}
            title={t('move.player.summaryTitle')}
            description={t('move.player.summaryBody', {
              exercises: totalExercises,
              minutes: estimateSessionMinutes(data),
            })}
          />
          <div className="flex flex-col gap-3">
            <span className="text-sm text-muted">{t('move.player.rateSession')}</span>
            <div className="flex gap-2">
              <Chip selected={rating === 'low'} onClick={() => setRating('low')}>
                {t('move.player.rateLow')}
              </Chip>
              <Chip selected={rating === 'mid'} onClick={() => setRating('mid')}>
                {t('move.player.rateMid')}
              </Chip>
              <Chip selected={rating === 'high'} onClick={() => setRating('high')}>
                {t('move.player.rateHigh')}
              </Chip>
            </div>
          </div>
          <Button size="lg" onClick={exitToList}>
            {t('move.player.backToMove')}
          </Button>
        </>
      ) : null}
    </Screen>
  );
}
