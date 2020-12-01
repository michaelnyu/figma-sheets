function buildTable({
  numCols,
  numRows,
  cellWidth,
  includeHeader,
  cellAlignment,
}) {
  const table = figma.createFrame();
  table.name = 'Figma Sheet';
  table.layoutMode = 'VERTICAL';
  table.counterAxisSizingMode = 'AUTO';

  // table styles
  table.strokeWeight = 3;
  table.strokeAlign = 'INSIDE';
  table.fills = [];
  table.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

  if (includeHeader) {
    const header = buildHeader({ numCols });
    table.appendChild(header);
  }

  return table;
}

let PersistentHeader;

function buildHeader({ numCols }) {
  const header = figma.createComponent();
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisSizingMode = 'AUTO';

  // Add Rows for the Header
  for (let i = numCols; i--; ) {
    header.appendChild(buildCell());
  }

  // save the header
  PersistentHeader = header;

  return header;
}

// Should only be used in buildHeader
function buildCell() {
  const cellFrame = figma.createFrame();
  const textFrame = figma.createFrame();
  const text = figma.createText();
  // layout styles
  textFrame.name = 'Figma Sheet - Cell';
  textFrame.layoutAlign = 'STRETCH';
  textFrame.horizontalPadding = 8;
  textFrame.verticalPadding = 10;

  // stroke styles
  cellFrame.appendChild(border.createInstance());

  textFrame.appendChild(text);
  cellFrame.appendChild(textFrame);
  return cellFrame;
}

const border = (function createBorder() {
  var frame1 = figma.createComponent();
  var line1 = figma.createLine();
  // frame1.resizeWithoutConstraints(0.01, 0.01)
  frame1.name = 'Table Border';
  line1.constraints = {
    horizontal: 'STRETCH',
    vertical: 'STRETCH',
  };
  frame1.constraints = {
    horizontal: 'STRETCH',
    vertical: 'STRETCH',
  };
  frame1.clipsContent = false;
  line1.resizeWithoutConstraints(10000, 0);
  line1.constraints = {
    horizontal: 'STRETCH',
    vertical: 'STRETCH',
  };
  line1.rotation = -90;
  line1.strokeWeight = 1;
  line1.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  frame1.appendChild(line1);
  return frame1;
})();

function tableMessageHandlerV2(msg) {
  if (msg.type === 'create-table') {
    const { numCols, numRows } = msg;
    if (!numCols || !numRows) {
      return;
    }

    const nodes = [];
    const table = buildTable({
      numCols,
      numRows,
      cellWidth: 100,
      includeHeader: true,
      cellAlignment: 'MIN',
    });
    figma.currentPage.appendChild(table);
    nodes.push(table);
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
}

export { tableMessageHandlerV2 };
