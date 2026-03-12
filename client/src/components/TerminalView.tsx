import { useEffect, useRef, useCallback } from 'react';
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
  const openedRef = useRef(false);

  const openTerminal = useCallback(() => {
    const fit = fitRef.current;
    const term = termRef.current;
    if (!fit || !term || openedRef.current) return;
    openedRef.current = true;

    const socket = getSocket();
    // Request PTY with current terminal dimensions
    const dims = fit.proposeDimensions();
    socket.emit('terminal:open', {
      agentId,
      cols: dims?.cols || 120,
      rows: dims?.rows || 30,
    });
  }, [agentId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
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
      cursorBlink: true,
      scrollback: 5000,
      convertEol: true,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    requestAnimationFrame(() => fit.fit());

    termRef.current = term;
    fitRef.current = fit;

    const socket = getSocket();

    // PTY output → xterm
    const onOutput = (data: { agentId: string; data: string }) => {
      if (data.agentId !== agentId) return;
      term.write(data.data);
    };
    socket.on('terminal:output', onOutput);

    // PTY exit
    const onExit = (data: { agentId: string; exitCode: number }) => {
      if (data.agentId !== agentId) return;
      term.write(`\r\n\x1b[90m[terminal exited with code ${data.exitCode}]\x1b[0m\r\n`);
      openedRef.current = false;
    };
    socket.on('terminal:exit', onExit);

    // xterm input → PTY
    const inputDisposable = term.onData((data: string) => {
      socket.emit('terminal:input', { agentId, data });
    });

    // Resize → PTY
    const resizeDisposable = term.onResize(({ cols, rows }) => {
      socket.emit('terminal:resize', { agentId, cols, rows });
    });

    const onWindowResize = () => {
      fit.fit();
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      socket.off('terminal:output', onOutput);
      socket.off('terminal:exit', onExit);
      inputDisposable.dispose();
      resizeDisposable.dispose();
      window.removeEventListener('resize', onWindowResize);
      // Close PTY when component unmounts
      if (openedRef.current) {
        socket.emit('terminal:close', agentId);
        openedRef.current = false;
      }
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [agentId]);

  // Open PTY and fit when becoming visible
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        fitRef.current?.fit();
        if (!openedRef.current) {
          openTerminal();
        }
        // Focus the terminal for keyboard input
        termRef.current?.focus();
      });
    }
  }, [visible, openTerminal]);

  return (
    <div
      ref={containerRef}
      className="terminal-view"
      style={{ display: visible ? 'flex' : 'none' }}
    />
  );
}
