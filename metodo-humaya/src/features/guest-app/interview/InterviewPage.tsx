import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buttonClasses, ChatBubble, ProgressSegments, SegmentedControl } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import {
  useAcceptPrivacy,
  useInterviewAnswers,
  useInterviewProgress,
  useInterviewQuestions,
  usePrivacyConsent,
  useSaveAnswer,
} from '@/hooks';
import type { InterviewDepth, InterviewQuestion } from '@/types';
import { localizedText } from '@/i18n/localizedText';
import { Screen, ScreenError, ScreenLoading } from '../layout/ScreenState';
import { useGuestLanguage } from '../layout/useGuestLanguage';
import { useCurrentStay } from '../layout/useCurrentStay';
import { AnswerInput } from './AnswerInput';
import { ConsentNotice } from './ConsentNotice';

export function InterviewPage() {
  const { stayId } = useCurrentStay();
  const { language } = useGuestLanguage();
  const { t } = useTranslation();
  const [depth, setDepth] = useState<InterviewDepth>('light');
  const [skipped, setSkipped] = useState<string[]>([]);

  const questions = useInterviewQuestions(depth);
  const answers = useInterviewAnswers(stayId);
  const progress = useInterviewProgress(stayId, depth);
  const consent = usePrivacyConsent(stayId);

  const saveAnswer = useSaveAnswer(stayId, depth);
  const acceptPrivacy = useAcceptPrivacy(stayId);
  const depthOptions = [
    { value: 'light' as const, label: t('interview.depthLight') },
    { value: 'deep' as const, label: t('interview.depthDeep') },
  ];

  function answerLabel(question: InterviewQuestion, value: string): string {
    if (value === '') return t('interview.answerSkipped');
    const option = question.options?.find((item) => item.id === value);
    return option ? localizedText(option.label, language) : value;
  }

  function changeDepth(next: InterviewDepth) {
    setDepth(next);
    setSkipped([]);
  }

  if (questions.isPending || answers.isPending || progress.isPending || consent.isPending) {
    return <ScreenLoading label={t('interview.loading')} />;
  }

  if (questions.isError || answers.isError || progress.isError) {
    return (
      <ScreenError
        onRetry={() => {
          void questions.refetch();
          void answers.refetch();
          void progress.refetch();
        }}
      />
    );
  }

  const list = questions.data ?? [];
  const given = answers.data ?? [];
  const valueOf = (questionId: string) =>
    given.find((answer) => answer.questionId === questionId)?.value;

  const history = list
    .filter((question) => valueOf(question.id) !== undefined || skipped.includes(question.id))
    .map((question) => ({
      question,
      value: valueOf(question.id) ?? '',
    }));

  const current = list.find(
    (question) => valueOf(question.id) === undefined && !skipped.includes(question.id),
  );

  const index = current ? list.indexOf(current) + 1 : list.length;
  const needsConsent = Boolean(current?.sensitive) && !consent.data;

  function answer(question: InterviewQuestion, value: string) {
    saveAnswer.mutate({
      questionId: question.id,
      value,
      answeredAt: new Date().toISOString(),
    });
  }

  function skip(question: InterviewQuestion) {
    setSkipped((previous) => [...previous, question.id]);
  }

  if (list.length === 0) {
    return (
      <Screen>
        <EmptyState title={t('interview.emptyTitle')} description={t('interview.emptyBody')} />
      </Screen>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 border-b border-line-soft px-5 pt-6 pb-3.5">
        <span className="text-eyebrow text-gold">{t('interview.eyebrow')}</span>
        <h1 className="m-0 font-display text-[34px] leading-none font-medium">
          {t('interview.title')}
        </h1>

        <SegmentedControl
          label={t('interview.depthLabel')}
          options={depthOptions}
          value={depth}
          onChange={changeDepth}
        />

        <ProgressSegments
          total={list.length}
          completed={progress.data?.answered ?? 0}
          label={t('interview.progressLabel')}
          valueText={t('interview.progressValue', {
            completed: progress.data?.answered ?? 0,
            total: list.length,
          })}
        />

        <p className="m-0 text-[13px] text-muted">
          {current
            ? t('interview.progress', {
                current: index,
                total: list.length,
                pillar: t(`interview.pillars.${current.pillar}`),
              })
            : t('interview.progressComplete')}
        </p>
      </header>

      <div className="flex flex-col gap-3 px-5 py-4.5">
        <ChatBubble from="concierge">{t('interview.aiNotice')}</ChatBubble>
        <p className="m-0 text-xs leading-relaxed text-muted-soft">
          {t('interview.privacyPrefix')}
          <a href="#privacidad" className="text-gold underline">
            {t('interview.privacyLink')}
          </a>
          {t('interview.privacySuffix')}
        </p>

        {history.map(({ question, value }) => (
          <div key={question.id} className="flex flex-col gap-2">
            <ChatBubble from="concierge">{localizedText(question.prompt, language)}</ChatBubble>
            <ChatBubble from="guest">{answerLabel(question, value)}</ChatBubble>
          </div>
        ))}

        {current ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 max-w-[300px] self-start rounded-bubble rounded-bl-sm border border-gold-dim bg-surface px-4 py-3 text-[15px] leading-relaxed">
              {localizedText(current.prompt, language)}
            </p>

            {needsConsent ? (
              <ConsentNotice
                onAccept={() => acceptPrivacy.mutate()}
                onSkip={() => skip(current)}
                pending={acceptPrivacy.isPending}
              />
            ) : (
              <AnswerInput
                question={current}
                pending={saveAnswer.isPending}
                onAnswer={(value) => answer(current, value)}
                onSkip={() => skip(current)}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <ChatBubble from="concierge">{t('interview.doneBody')}</ChatBubble>
            <Link to="/app" className={buttonClasses('outline', 'md')}>
              {t('interview.doneCta')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
