import * as React from 'react';
import '../styles/ui.css';

declare function require(path: string): any;

const App = ({}) => {
  const rowsBox = React.useRef<HTMLInputElement>(undefined);
  const colsBox = React.useRef<HTMLInputElement>(undefined);

  const rowsRef = React.useCallback((element: HTMLInputElement) => {
    if (element) element.value = '5';
    rowsBox.current = element;
  }, []);

  const colsRef = React.useCallback((element: HTMLInputElement) => {
    if (element) element.value = '5';
    colsBox.current = element;
  }, []);

  const onCreate = React.useCallback(() => {
    const rowsCnt = parseInt(rowsBox.current.value, 10);
    const colsCnt = parseInt(colsBox.current.value, 10);

    parent.postMessage(
      { pluginMessage: { type: 'create-grid', rowsCnt, colsCnt } },
      '*',
    );
  }, []);

  const onCancel = React.useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
  }, []);

  React.useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = event => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'create-rectangles') {
        console.log(`Figma Says: ${message}`);
      }
    };
  }, []);

  return (
    <div>
      <img src={require('../assets/logo.svg')} />
      <h2>Rectangle Creator</h2>
      <p>
        Rows: <input ref={rowsRef} />
      </p>
      <p>
        Columns: <input ref={colsRef} />
      </p>
      <button id="create" onClick={onCreate}>
        Create
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default App;
