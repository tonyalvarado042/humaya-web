import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from './cn';

export interface AccordionItem {
  id: string;
  title: string;
  body: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Id del ítem abierto al montar. Por defecto, ninguno. */
  defaultOpenId?: string;
}

/** Instructivos de la villa. Solo uno abierto a la vez, como en el prototipo. */
export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const baseId = useId();

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface-sunken">
      {items.map((item) => {
        const isOpen = item.id === openId;
        const panelId = `${baseId}-${item.id}`;

        return (
          <div key={item.id} className="border-b border-line-soft last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex min-h-13 w-full items-center justify-between gap-3 px-4 text-left text-[15px] font-medium text-text transition-colors hover:text-gold-bright"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
                className={cn('shrink-0 text-gold transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen ? (
              <div id={panelId} className="px-4 pb-4 text-sm leading-relaxed text-muted">
                {item.body}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
