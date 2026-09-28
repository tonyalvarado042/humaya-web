import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { useUpdateWowStatus, useWowSuggestions } from '@/hooks';
import type { WowStatus } from '@/types';
import { profileCopy as copy } from './copy';

const statusLabel: Record<WowStatus, string> = {
  suggested: copy.statusSuggested,
  planned: copy.statusPlanned,
  done: copy.statusDone,
};

const statusTone: Record<WowStatus, 'neutral' | 'warning' | 'success'> = {
  suggested: 'neutral',
  planned: 'warning',
  done: 'success',
};

/** El siguiente estado, y cómo se llama el botón que lleva hasta ahí. */
const nextStep: Record<WowStatus, { next: WowStatus | null; action: string }> = {
  suggested: { next: 'planned', action: copy.actionPlan },
  planned: { next: 'done', action: copy.actionDone },
  done: { next: null, action: copy.actionFinished },
};

/** Las experiencias WOW de una estadía, con su avance de estado. */
export function WowPanel({ stayId }: { stayId: string }) {
  const wows = useWowSuggestions(stayId);
  const updateStatus = useUpdateWowStatus(stayId);

  return (
    <section
      aria-labelledby="wow-title"
      className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5"
    >
      <div className="flex flex-col gap-0.5">
        <h2 id="wow-title" className="m-0 font-display text-[28px] font-medium">
          {copy.wowTitle}
        </h2>
        <span className="text-[13px] text-muted">{copy.wowSubtitle}</span>
      </div>

      {wows.isPending ? (
        <>
          <span aria-live="polite" className="sr-only">
            Cargando las experiencias sugeridas…
          </span>
          <Skeleton variant="block" className="h-32" />
          <Skeleton variant="block" className="h-32" />
        </>
      ) : null}

      {wows.data?.length === 0 ? (
        <EmptyState title={copy.wowEmptyTitle} description={copy.wowEmptyBody} />
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {wows.data?.map((wow) => {
          const { next, action } = nextStep[wow.status];

          return (
            <li key={wow.id}>
              <Card className="flex flex-col gap-2.5 bg-surface-sunken">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">{copy.pillarNames[wow.pillar]}</span>
                  <Badge tone={statusTone[wow.status]}>{statusLabel[wow.status]}</Badge>
                </div>
                <p className="m-0 text-base leading-snug font-medium">{wow.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted">
                  {copy.wowWhy} {wow.reason}
                </p>
                <Button
                  variant={next ? 'ink' : 'ghost'}
                  disabled={!next || updateStatus.isPending}
                  onClick={() => next && updateStatus.mutate({ id: wow.id, status: next })}
                  className="self-start"
                >
                  {action}
                </Button>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
