# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, each using its default label string. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Design Context

Before any UI/design work, read `PRODUCT.md` (strategic: register, users, principles,
anti-references) and `DESIGN.md` (visual system: tokens, typography, components) at the
repo root. They are the source of truth for the matrix web app (`apps/web/`) — keep new
screens on-brand and honor the No-Color-Alone and One Voice rules.
