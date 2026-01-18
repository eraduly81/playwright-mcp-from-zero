(() => {
  const { useEffect, useMemo, useState } = React;

  function App() {
    const [tests, setTests] = useState([]);
    const [selected, setSelected] = useState('');
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [running, setRunning] = useState(false);

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
