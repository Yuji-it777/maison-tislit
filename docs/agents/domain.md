# Domain Docs: Single-Context Layout

This repo uses a **single-context** layout:

- `CONTEXT.md` at the repo root — the single source of truth for domain terminology, concepts, and rules.
- `docs/adr/` — Architecture Decision Records, one per decision, named `YYYY-MM-DD-short-title.md`.

## Consumer Rules

Agents and skills reading domain context:

1. **Read `CONTEXT.md` first** — it defines the vocabulary and high-level model.
2. **Read relevant ADRs** — each ADR records one architectural decision with context, consequences, and alternatives.
3. **Do not assume** — if a term isn't in `CONTEXT.md`, ask; don't invent.
4. **Update `CONTEXT.md`** — when new domain concepts emerge, add them there.
5. **Write ADRs** — for any decision that changes the domain model or architecture, add an ADR.

## ADR Template

```markdown
# YYYY-MM-DD-short-title

## Status
Proposed | Accepted | Superseded

## Context
What is the issue? What forces are at play?

## Decision
What are we doing? Be specific.

## Consequences
### Positive
- ...

### Negative
- ...

### Neutral
- ...

## Alternatives Considered
- Option A: ...
- Option B: ...
```

## File Locations

- Root context: `./CONTEXT.md`
- ADR directory: `./docs/adr/`