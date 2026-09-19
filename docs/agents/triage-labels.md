# Triage Labels

The five canonical triage roles map to these GitHub labels exactly:

| Role | Label |
|------|-------|
| Needs Triage | `needs-triage` |
| Needs Info | `needs-info` |
| Ready for Agent | `ready-for-agent` |
| Ready for Human | `ready-for-human` |
| Won't Fix | `wontfix` |

## Usage

- `triage` skill applies these labels directly via `gh issue edit --add-label`.
- No prefix/suffix; label names equal the role names.
- When creating new labels, use the exact strings above.