(() => {
  const { useEffect, useMemo, useState } = React;

  function App() {
    const [tests, setTests] = useState([]);
    const [selected, setSelected] = useState('');
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [running, setRunning] = useState(false);
    const [sessionOutput, setSessionOutput] = useState('');
    const [sessionError, setSessionError] = useState('');
    const [model, setModel] = useState('gpt-realtime');
    const [voice, setVoice] = useState('');
    const [instructions, setInstructions] = useState(
      'You are a concise voice assistant. Use MCP tools when asked.'
    );
    const [mcpUrl, setMcpUrl] = useState('');
    const [mcpOutput, setMcpOutput] = useState('');
    const [mcpError, setMcpError] = useState('');

    useEffect(() => {
      fetch('/api/tests')
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data.tests) ? data.tests : [];
          setTests(list);
          if (list.length && !selected) {
            setSelected(list[0]);
          }
        })
        .catch(err => {
          setError(`Failed to load tests: ${err.message}`);
        });
    }, []);

    useEffect(() => {
      if (!selected) {
        setCommand('');
        return;
      }
      setCommand(`npx playwright test ${selected}`);
    }, [selected]);

    const status = useMemo(() => {
      if (running) return 'Running...';
      if (error) return 'Error';
      if (output) return 'Completed';
      return 'Idle';
    }, [running, error, output]);

    function runTest() {
      if (!selected || running) return;
      setRunning(true);
      setError('');
      setOutput('');

      fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: selected }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          }
          const combined = [data.stdout, data.stderr].filter(Boolean).join('\n');
          setOutput(combined || 'No output.');
        })
        .catch(err => {
          setError(`Run failed: ${err.message}`);
        })
        .finally(() => setRunning(false));
    }

    function createSession() {
      setSessionOutput('');
      setSessionError('');
      fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.trim() || 'gpt-realtime',
          voice: voice.trim() || undefined,
          instructions: instructions.trim(),
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setSessionError(data.error);
            return;
          }
          setSessionOutput(JSON.stringify(data, null, 2));
        })
        .catch(err => {
          setSessionError(`Session failed: ${err.message}`);
        });
    }

    function listMcp(endpoint, setBusyLabel) {
      setMcpOutput(setBusyLabel);
      setMcpError('');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverUrl: mcpUrl.trim() || undefined }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setMcpError(data.error);
            return;
          }
          setMcpOutput(JSON.stringify(data, null, 2));
        })
        .catch(err => {
          setMcpError(`MCP failed: ${err.message}`);
        });
    }

    return React.createElement(
      'div',
      { className: 'app' },
      React.createElement('header', { className: 'header' }, [
        React.createElement('h1', { key: 'title' }, 'Playwright Test Runner'),
        React.createElement(
          'p',
          { key: 'subtitle', className: 'subtitle' },
          'Select a test, generate the command, and run it locally.'
        ),
      ]),
      React.createElement('section', { className: 'panel' }, [
        React.createElement('label', { key: 'label', htmlFor: 'test-select' }, 'Test file'),
        React.createElement(
          'select',
          {
            key: 'select',
            id: 'test-select',
            value: selected,
            onChange: e => setSelected(e.target.value),
          },
          tests.map(test =>
            React.createElement('option', { key: test, value: test }, test)
          )
        ),
        React.createElement(
          'div',
          { key: 'command', className: 'command' },
          command ? React.createElement('code', null, command) : 'Pick a test to see the command.'
        ),
        React.createElement(
          'button',
          {
            key: 'button',
            className: 'run-button',
            onClick: runTest,
            disabled: running || !selected,
          },
          running ? 'Running...' : 'Run test'
        ),
        React.createElement(
          'div',
          { key: 'status', className: `status status-${status.toLowerCase()}` },
          `Status: ${status}`
        ),
      ]),
      React.createElement('section', { className: 'panel' }, [
        React.createElement('h2', { key: 'voice-title' }, 'Realtime voice session'),
        React.createElement(
          'label',
          { key: 'model-label', htmlFor: 'model-input' },
          'Model'
        ),
        React.createElement('input', {
          key: 'model-input',
          id: 'model-input',
          value: model,
          onChange: e => setModel(e.target.value),
        }),
        React.createElement(
          'label',
          { key: 'voice-label', htmlFor: 'voice-input' },
          'Voice (optional)'
        ),
        React.createElement('input', {
          key: 'voice-input',
          id: 'voice-input',
          value: voice,
          placeholder: 'alloy',
          onChange: e => setVoice(e.target.value),
        }),
        React.createElement(
          'label',
          { key: 'instructions-label', htmlFor: 'instructions-input' },
          'Instructions'
        ),
        React.createElement('textarea', {
          key: 'instructions-input',
          id: 'instructions-input',
          rows: 3,
          value: instructions,
          onChange: e => setInstructions(e.target.value),
        }),
        React.createElement(
          'button',
          { key: 'session-button', className: 'run-button', onClick: createSession },
          'Create session'
        ),
        React.createElement(
          'pre',
          { key: 'session-output', className: 'output' },
          sessionError ? `Error:\n${sessionError}` : sessionOutput || 'No session yet.'
        ),
      ]),
      React.createElement('section', { className: 'panel' }, [
        React.createElement('h2', { key: 'mcp-title' }, 'MCP discovery'),
        React.createElement(
          'label',
          { key: 'mcp-label', htmlFor: 'mcp-input' },
          'MCP server URL'
        ),
        React.createElement('input', {
          key: 'mcp-input',
          id: 'mcp-input',
          value: mcpUrl,
          placeholder: 'https://developers.openai.com/mcp',
          onChange: e => setMcpUrl(e.target.value),
        }),
        React.createElement(
          'div',
          { key: 'mcp-actions', className: 'button-row' },
          [
            React.createElement(
              'button',
              {
                key: 'mcp-tools',
                className: 'ghost-button',
                onClick: () => listMcp('/api/mcp/tools-list', 'Loading tools...'),
              },
              'List tools'
            ),
            React.createElement(
              'button',
              {
                key: 'mcp-resources',
                className: 'ghost-button',
                onClick: () => listMcp('/api/mcp/resources-list', 'Loading resources...'),
              },
              'List resources'
            ),
          ]
        ),
        React.createElement(
          'pre',
          { key: 'mcp-output', className: 'output' },
          mcpError ? `Error:\n${mcpError}` : mcpOutput || 'No MCP data yet.'
        ),
      ]),
      React.createElement('section', { className: 'panel' }, [
        React.createElement('h2', { key: 'output-title' }, 'Output'),
        React.createElement(
          'pre',
          { key: 'output', className: 'output' },
          error ? `Error:\n${error}` : output || 'No output yet.'
        ),
      ])
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
})();
