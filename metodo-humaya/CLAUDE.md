# Método Humaya

**Leé `AGENTS.md` antes de tocar nada.** Ahí está el contrato completo del proyecto: qué es, cómo se
corre, la regla de capas, las trampas conocidas, las reglas de trabajo y el mapa de la documentación.

Se mantiene en un solo archivo a propósito, para que no se desincronice entre agentes: en este
proyecto trabajan Claude Code y Codex, y Codex no lee `CLAUDE.md`.

## Lo mínimo, por si no leíste todavía

- Frontend solo, con datos de ejemplo. Fases 0 a 5 cerradas; la **Fase 6** está en curso dentro del
  repositorio oficial.
- Una pantalla **nunca** importa de `src/mocks/`: pantalla → hook → servicio → mock.
- Antes de dar algo por terminado: `npx prettier --write "src/**/*.{ts,tsx,css}"`, después `lint`,
  `typecheck`, `test` y `build`.
- Al cerrar una fase: marcar criterios en `docs/PLAN.md` y anotar lo hecho en `docs/ESTADO.md`.
- Toda decisión tomada sin Anthony se anota en `docs/FEEDBACK.md`.
