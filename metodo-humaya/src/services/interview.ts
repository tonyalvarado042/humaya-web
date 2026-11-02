import { depthFor, QUESTIONS, state } from '@/mocks';
import type {
  InterviewAnswer,
  InterviewDepth,
  InterviewProgress,
  InterviewQuestion,
} from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

export async function getQuestions(depth: InterviewDepth): Promise<InterviewQuestion[]> {
  assertMocks('interview.getQuestions');
  await delay();
  return QUESTIONS.filter((question) => question.depth === depth);
}

export async function getAnswers(stayId: string): Promise<InterviewAnswer[]> {
  assertMocks('interview.getAnswers');
  await delay();
  return state.answers[stayId] ?? [];
}

export async function getProgress(
  stayId: string,
  depth?: InterviewDepth,
): Promise<InterviewProgress> {
  assertMocks('interview.getProgress');
  await delay();
  return progressOf(stayId, depth);
}

export async function saveAnswer(
  stayId: string,
  answer: InterviewAnswer,
  depth?: InterviewDepth,
): Promise<InterviewProgress> {
  assertMocks('interview.saveAnswer');
  await delay();

  const question = QUESTIONS.find((item) => item.id === answer.questionId);
  if (!question) {
    throw new Error(`No existe la pregunta ${answer.questionId}`);
  }

  const answers = state.answers[stayId] ?? [];
  const existing = answers.findIndex((item) => item.questionId === answer.questionId);
  if (existing >= 0) {
    answers[existing] = answer;
  } else {
    answers.push(answer);
  }
  state.answers[stayId] = answers;

  return progressOf(stayId, depth);
}

/**
 * Cálculo puro del avance, para poder reusarlo sin pagar el retraso.
 * Sin `depth`, usa la entrevista que la estadía tiene elegida.
 */
export function progressOf(
  stayId: string,
  depth: InterviewDepth = depthFor(stayId),
): InterviewProgress {
  const total = QUESTIONS.filter((question) => question.depth === depth).length;
  const ids = new Set(
    QUESTIONS.filter((question) => question.depth === depth).map((question) => question.id),
  );
  const answered = (state.answers[stayId] ?? []).filter((answer) =>
    ids.has(answer.questionId),
  ).length;

  return { depth, answered, total, complete: answered >= total };
}
