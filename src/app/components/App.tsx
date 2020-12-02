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

  const onCreateV2 = React.useCallback(() => {
    const numRows = parseInt(rowsBox.current.value, 10);
    const numCols = parseInt(colsBox.current.value, 10);

    parent.postMessage(
      { pluginMessage: { type: 'create-table', numRows, numCols } },
      '*',
    );
  }, []);

  const onCreateV3 = React.useCallback(() => {
    const rowCount = parseInt(rowsBox.current.value, 10);
    const columnCount = parseInt(colsBox.current.value, 10);

    parent.postMessage(
      {
        pluginMessage: {
          type: 'create-table',
          rowCount,
          columnCount,
          cellAlignment: 'CENTER',
          includeHeader: true,
          columnResizing: true,
          cellWidth: 100,
          remember: true,
        },
      },
      '*',
    );
  }, []);

  const onCancel = React.useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
  }, []);

  const onReplaceValues = React.useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'replace-values' } }, '*');
  }, []);

  const addCol = React.useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'add-col' } }, '*');
  }, []);

  const deleteCol = React.useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'delete-col' } }, '*');
  }, []);

  React.useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = event => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'create-rectangles') {
        console.log(`Figma Says: ${message}`);
      }
    };

    parent.postMessage({ pluginMessage: { type: 'create-components' } }, '*');
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
      <button id="create" onClick={onCreateV3}>
        Create
      </button>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onReplaceValues}>Rerender</button>
      <button onClick={addCol}>Add column</button>
      <button onClick={deleteCol}>Delete column</button>
    </div>
  );
};

export default App;
