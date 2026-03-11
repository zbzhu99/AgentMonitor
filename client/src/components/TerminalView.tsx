import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { getSocket } from '../api/socket';

interface Props {
  agentId: string;
  visible: boolean;
}

export function TerminalView({ agentId, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#e6edf3',
        selectionBackground: '#264f78',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39d353',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d364',
        brightWhite: '#f0f6fc',
      },
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
      cursorBlink: false,
      disableStdin: true,
      scrollback: 5000,
      convertEol: true,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);

    // Delay initial fit to allow container to layout
    requestAnimationFrame(() => fit.fit());

    termRef.current = term;
    fitRef.current = fit;

    const socket = getSocket();
    const onTerminal = (data: { agentId: string; chunk: { stream: string; data: string } }) => {
      if (data.agentId !== agentId) return;
      try {
        const bytes = atob(data.chunk.data);
        term.write(bytes);
      } catch {
        // ignore decode errors
      }
    };
    socket.on('agent:terminal', onTerminal);

    const onResize = () => fit.fit();
    window.addEventListener('resize', onResize);

    return () => {
      socket.off('agent:terminal', onTerminal);
      window.removeEventListener('resize', onResize);
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [agentId]);

  // Re-fit when visibility changes
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => fitRef.current?.fit());
    }
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="terminal-view"
      style={{ display: visible ? 'flex' : 'none' }}
    />
  );
}
