# Agent Chat

The chat interface provides a web-based terminal for interacting with individual agents, similar to using Claude Code or Codex in a terminal.

## Features

- **Real-time message streaming**: See agent responses as they arrive
- **Remote terminal attachment**: Toggle a live embedded terminal to see raw CLI output with full ANSI color rendering
- **Expandable tool details**: Click on tool calls to expand/collapse full input and output
- **Session resume**: Send a message to a stopped agent to automatically restart with `--resume`
- **Optimistic messages**: User messages appear instantly with a thinking indicator while waiting for agent response
- **Slash commands**: 25 commands matching Claude Code CLI (see [Slash Commands](/guide/slash-commands))
- **CLAUDE.md editor**: Edit agent instructions mid-session
- **Double Esc interrupt**: Press Escape twice quickly to interrupt a running agent
- **Cost tracking**: Live cost and token usage in the header

## Chat Header

The header shows:
- Provider badge and agent name
- Working directory and cost summary
- Status indicator with color coding
- Clone button — duplicate agent configuration
- Edit CLAUDE.md button
- **Terminal button** — toggle the embedded terminal view
- Stop button (when agent is running)

## Terminal View

Click the **Terminal** button in the header to switch from the chat view to a live terminal. The terminal renders the agent's raw stdout/stderr output using xterm.js, preserving ANSI colors and formatting — the same output you'd see if you attached to the agent's terminal session directly.

- **Read-only**: The terminal is for monitoring; use the chat input to send messages
- **5000-line scrollback**: Scroll up to review past output
- **Auto-resize**: The terminal fits the available space and adapts to window resizing
- **Works remotely**: Terminal data streams through the relay tunnel just like chat messages

Toggle back to chat view by clicking the Terminal button again. Both views stay mounted so no data is lost when switching.

## Message Types

Messages are color-coded by role:
- **User messages**: Your input to the agent
- **Assistant messages**: Agent responses (highlighted)
- **Tool messages**: Tool usage indicators (click to expand full input/output)
- **System messages**: Local command output (from slash commands)
