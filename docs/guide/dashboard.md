# Dashboard

The dashboard provides a real-time overview of all your AI coding agents.

## Agent Cards

Each agent is displayed as a card showing:
- **Provider badge**: CLAUDE (purple) or CODEX (green)
- **Agent name**: Click to enter chat view
- **Status indicator**: Running (green), Stopped (gray), Error (red), Waiting Input (yellow)
- **Cost**: Total API cost in USD
- **Token usage**: Input + output tokens
- **Latest message**: Preview of the most recent agent response
- **Working directory**: Path where the agent operates

## Actions

- **+ New Agent**: Navigate to the agent creation form
- **Stop All**: Stop all running agents at once
- **Delete**: Remove a stopped agent (click the X button)
- **Settings**: Configure auto-delete retention for stopped agents

## Auto-Delete Expired Agents

Stopped agents can be automatically cleaned up after a configurable retention period. Open **Settings** from the dashboard to set the retention time in hours (default: 24 hours). Set to 0 to keep agents forever. The server checks for expired agents every 60 seconds.

## Real-time Updates

The dashboard uses Socket.IO for live updates. Agent status changes, new messages, and cost updates stream instantly without refreshing the page via `agent:update` (per-agent room events) and `agent:snapshot` (broadcast dashboard updates).
