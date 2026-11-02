import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Input } from '@/components/ui';
import { localizedText } from '@/i18n/localizedText';
import type { InterviewQuestion } from '@/types';
import { useGuestLanguage } from '../layout/useGuestLanguage';

interface AnswerInputProps {
  question: InterviewQuestion;
  pending: boolean;
  onAnswer: (value: string) => void;
  onSkip: () => void;
}

/** Las opciones de la pregunta actual, o un campo si es de respuesta abierta. */
export function AnswerInput({ question, pending, onAnswer, onSkip }: AnswerInputProps) {
  const [draft, setDraft] = useState('');
  const { t } = useTranslation();
  const { language } = useGuestLanguage();

  return (
    <div className="flex flex-col gap-2.5">
      {question.sensitive ? (
        <p className="m-0 text-xs text-muted-soft">{t('interview.sensitiveHint')}</p>
      ) : null}

      {question.options ? (
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => (
            <Chip key={option.id} disabled={pending} onClick={() => onAnswer(option.id)}>
              {localizedText(option.label, language)}
            </Chip>
          ))}
        </div>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const text = draft.trim();
            if (!text) return;
            onAnswer(text);
            setDraft('');
          }}
        >
          <Input
            label={t('interview.openLabel')}
            hideLabel
            placeholder={t('interview.openPlaceholder')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button type="submit" disabled={pending || draft.trim() === ''} className="self-start">
            {t('interview.send')}
          </Button>
        </form>
      )}

      {question.sensitive ? (
        <button
          type="button"
          onClick={onSkip}
          className="min-h-11 self-start text-sm text-muted underline"
        >
          {t('interview.skip')}
        </button>
      ) : null}
    </div>
  );
}
