import { Send } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Accordion,
  Badge,
  Button,
  Card,
  ChatBubble,
  Chip,
  Drawer,
  EmptyState,
  IconButton,
  Input,
  ProgressSegments,
  SegmentedControl,
  Skeleton,
  SlotGrid,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tag,
  Textarea,
} from '@/components/ui';

interface UiKitCatalogProps {
  themeName: 'guest' | 'staff';
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-line-soft pb-7">
      <h2 className="m-0 font-display text-2xl font-medium">{title}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

const guides = [
  {
    id: 'aire',
    title: 'Aire acondicionado',
    body: 'El control está en la pared, al lado de la cama. Para dormir recomendamos 23 °C y el modo silencioso.',
  },
  {
    id: 'agua',
    title: 'Agua caliente',
    body: 'El calentador queda encendido siempre. Girá la llave de la ducha hacia la izquierda y esperá unos 30 segundos.',
  },
];

const slots = [
  { id: '16:00', label: '16:00' },
  { id: '17:00', label: '17:00' },
  { id: '18:00', label: '18:00', taken: true },
  { id: '19:00', label: '19:00' },
  { id: '20:00', label: '20:00', taken: true },
  { id: '21:00', label: '21:00' },
];

const depthOptions = [
  { value: 'light' as const, label: 'Light · 5 preguntas' },
  { value: 'deep' as const, label: 'Profunda · 18' },
];

/** Todas las piezas del kit, con sus variantes y estados. */
export function UiKitCatalog({ themeName }: UiKitCatalogProps) {
  const [chipOn, setChipOn] = useState(true);
  const [depth, setDepth] = useState<'light' | 'deep'>('light');
  const [slotId, setSlotId] = useState<string | null>('17:00');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-7 px-6 py-8">
      <span className="text-eyebrow text-gold">Tema {themeName}</span>

      <Section title="Button">
        <Button>Continuar entrevista</Button>
        <Button variant="outline">Cambiar</Button>
        <Button variant="ghost">Sugerir otras</Button>
        <Button variant="ink">Marcar como lista</Button>
        <Button size="lg">Reservar sauna · 17:00</Button>
        <Button disabled>Elegí un horario</Button>
      </Section>

      <Section title="IconButton">
        <IconButton aria-label="Enviar mensaje">
          <Send size={20} strokeWidth={1.8} aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Enviar mensaje" variant="outline">
          <Send size={20} strokeWidth={1.8} aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Enviar mensaje" size="lg" disabled>
          <Send size={20} strokeWidth={1.8} aria-hidden="true" />
        </IconButton>
      </Section>

      <Section title="Chip">
        <Chip selected={chipOn} onClick={() => setChipOn(!chipOn)}>
          En pareja
        </Chip>
        <Chip>En familia</Chip>
        <Chip>Con amigos</Chip>
        <Chip disabled>Solo o sola</Chip>
      </Section>

      <Section title="Card">
        <Card className="w-64">
          <p className="m-0 text-sm text-muted">Tarjeta por defecto</p>
        </Card>
        <Card variant="accent" className="w-64">
          <span className="text-eyebrow text-gold">Método Humaya</span>
          <p className="m-0 mt-2 text-sm text-muted">Tarjeta destacada</p>
        </Card>
        <Card variant="ink" className="w-64">
          <p className="m-0 font-display text-xl italic">Con calma y espacio.</p>
        </Card>
      </Section>

      <Section title="Badge y Tag">
        <Badge tone="success">Completa</Badge>
        <Badge tone="warning">En progreso</Badge>
        <Badge tone="neutral">Pendiente</Badge>
        <Tag tone="alert">Andrés: alergia a frutos secos</Tag>
        <Tag tone="celebration">Aniversario · 5 años</Tag>
        <Tag tone="info">Valeria no toma alcohol</Tag>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          label="Tipo de entrevista"
          options={depthOptions}
          value={depth}
          onChange={setDepth}
        />
      </Section>

      <Section title="ProgressSegments">
        <div className="flex w-72 flex-col gap-2">
          <ProgressSegments total={5} completed={3} label="Avance de la entrevista" />
          <span className="text-[13px] text-muted">Pregunta 4 de 5 · Believe</span>
        </div>
      </Section>

      <Section title="ChatBubble">
        <div className="flex w-80 flex-col gap-3">
          <ChatBubble from="concierge">
            Hola, soy tu concierge de Humaya. Estoy acá las 24 horas.
          </ChatBubble>
          <ChatBubble from="guest">¿Cómo pongo el agua caliente?</ChatBubble>
        </div>
      </Section>

      <Section title="Accordion">
        <div className="w-80">
          <Accordion items={guides} defaultOpenId="aire" />
        </div>
      </Section>

      <Section title="SlotGrid">
        <div className="w-80">
          <SlotGrid
            label="Horarios de sauna"
            slots={slots}
            selectedId={slotId}
            onSelect={setSlotId}
          />
        </div>
      </Section>

      <Section title="StatTile">
        <div className="w-44">
          <StatTile label="Llegadas hoy" value="4" />
        </div>
        <div className="w-52">
          <StatTile label="Ocupación esta noche" value="8" suffix="de 10" />
        </div>
        <div className="w-56">
          <StatTile label="Experiencias WOW por preparar" value="5" variant="ink" />
        </div>
      </Section>

      <Section title="Input y Textarea">
        <div className="w-72">
          <Input label="Mensaje para el concierge" placeholder="Escribile a tu concierge…" />
        </div>
        <div className="w-72">
          <Input
            label="Correo"
            defaultValue="valeria@"
            error="Revisá el correo, parece incompleto."
          />
        </div>
        <div className="w-72">
          <Input label="Villa" defaultValue="Villa 04" disabled />
        </div>
        <div className="w-72">
          <Textarea
            label="Notas del equipo"
            placeholder="Ej.: llegaron cansados del vuelo, ofrecer la cena en la villa."
          />
        </div>
      </Section>

      <Section title="EmptyState">
        <div className="w-96">
          <EmptyState
            title="Todavía no hay reservas"
            description="Cuando reserves sauna o cold plunge las vas a ver acá."
            action={<Button variant="outline">Ver horarios</Button>}
          />
        </div>
      </Section>

      <Section title="Table">
        <div className="w-full max-w-xl rounded-card border border-line bg-surface">
          <Table aria-label="Ejemplo de llegadas">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Huésped</TableHeaderCell>
                <TableHeaderCell>Villa</TableHeaderCell>
                <TableHeaderCell>Entrevista</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Valeria Méndez y Andrés Rojas</TableCell>
                <TableCell>Villa 04</TableCell>
                <TableCell>
                  <Badge tone="success">Completa</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Camille Durand</TableCell>
                <TableCell>Villa 02</TableCell>
                <TableCell>
                  <Badge tone="warning">En curso · 3/5</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Drawer">
        <Button variant="outline" onClick={() => setDrawerOpen(true)}>
          Abrir menú de ejemplo
        </Button>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Recepción">
          <p className="m-0 text-sm text-ink-muted">
            Acá va la navegación del dashboard en pantallas angostas.
          </p>
        </Drawer>
      </Section>

      <Section title="Skeleton">
        <div className="flex w-80 flex-col gap-3">
          <Skeleton variant="block" />
          <Skeleton variant="line" className="w-3/4" />
          <Skeleton variant="circle" />
        </div>
      </Section>
    </div>
  );
}
