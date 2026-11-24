import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /**
   * El tema con el que se pinta. **Obligatorio a propósito.**
   *
   * ── EL FALLO QUE ESTO ARREGLA ─────────────────────────────────────────
   * Tony, 24 de noviembre de 2026, con una captura del menú de recepción en
   * el teléfono: «sigue el error en mobile de menú, no probaste».
   *
   * El menú salía **transparente**: el nombre de cada destino encima de los
   * números de la pantalla, ilegible. Medido en el navegador:
   *
   *   dentro de [data-theme] → false
   *   fondo del panel        → rgba(0, 0, 0, 0)
   *   --nav en el panel      → (vacía)
   *
   * La causa es `createPortal(..., document.body)`: el panel se monta fuera
   * del `<div data-theme="staff">`, y los colores de este proyecto viven en
   * variables declaradas DENTRO de ese atributo —a propósito, para poder
   * mostrar los dos temas a la vez en /dev/ui—. Sin el atributo no hay
   * variables, y `bg-nav` no pinta nada.
   *
   * Por eso es obligatorio y no tiene valor por omisión: un portal sin tema
   * se ve roto, y eso tiene que fallar al compilar y no en el teléfono de
   * alguien. Es el único `createPortal` del proyecto; el día que haya otro,
   * esta prop le recuerda el problema.
   */
  tema: 'staff' | 'guest';
}

/**
 * Diálogo modal deslizable desde la izquierda, para la navegación de
 * recepción bajo 1024 px.
 *
 * jsdom no implementa `<dialog>.showModal()`, así que en vez del elemento
 * nativo esto atrapa el foco a mano: mismo patrón que usan por debajo Radix
 * y la mayoría de los "sheet" accesibles.
 */
export function Drawer({ open, onClose, title, children, tema }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    // El tema va acá y no en el panel: el fondo oscuro también usa una
    // variable, y este div es la raíz de todo lo que el portal monta.
    <div data-theme={tema} className="fixed inset-0 z-50">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col gap-4',
          'bg-nav p-5 text-on-ink outline-none',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg text-gold">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex size-11 items-center justify-center rounded-pill text-on-ink hover:text-gold"
          >
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
