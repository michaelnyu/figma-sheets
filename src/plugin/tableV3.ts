// COPIED FROM: https://github.com/limitlessloop/figma-table-creator
//
function clone(val) {
  return JSON.parse(JSON.stringify(val));
}

async function changeText(node, text, weight?) {
  if (node.fontName === figma.mixed) {
    await figma.loadFontAsync(node.getRangeFontName(0, 1) as FontName);
  } else {
    await figma.loadFontAsync({
      family: node.fontName.family,
      style: weight || node.fontName.style,
    });
  }

  if (weight) {
    node.fontName = {
      family: node.fontName.family,
      style: weight,
    };
  }

  if (text) {
    node.characters = text;
  }

  if (text === '') {
    // Fixes issue where spaces are ignored and node has zero width
    node.resize(10, node.height);
  }

  node.textAutoResize = 'HEIGHT';
  node.layoutAlign = 'STRETCH';
}

function cloneComponentAsFrame(component) {
  if (!component) {
    return false;
  }

  var frame = figma.createFrame();

  if (component.name) {
    frame.name = component.name;
  }

  if (component.fillStyleId == '') {
    frame.fills = component.fills;
  } else {
    frame.fillStyleId = component.fillStyleId;
  }

  if (component.strokeStyleId == '') {
    frame.strokes = component.strokes;
  } else {
    frame.strokeStyleId = component.strokeStyleId;
  }

  frame.strokeWeight = component.strokeWeight;

  frame.strokeAlign = component.strokeAlign;
  frame.strokeCap = component.strokeCap;
  frame.strokeJoin = component.strokeJoin;
  frame.strokeMiterLimit = component.strokeMiterLimit;
  frame.topLeftRadius = component.topLeftRadius;
  frame.topRightRadius = component.topRightRadius;
  frame.bottomLeftRadius = component.bottomLeftRadius;
  frame.bottomRightRadius = component.bottomRightRadius;
  frame.layoutMode = component.layoutMode;
  frame.counterAxisSizingMode = component.counterAxisSizingMode;

  frame.dashPattern = component.dashPattern;
  frame.clipsContent = component.clipsContent;

  frame.effects = clone(component.effects);

  for (let i = 0; i < component.children.length; i++) {
    frame.appendChild(component.children[i].clone());
  }

  return frame;
}

function removeChildren(node) {
  var length = node.children.length;

  if (length > 0) {
    for (let i = 0; i < length; i++) {
      node.children[0].remove();
    }
    // node.children[0].remove()
  }
}

function createBorder() {
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

  const strokes = clone(line1.strokes);

  strokes[0].color.r = 0.725490196078431;
  strokes[0].color.g = 0.725490196078431;
  strokes[0].color.b = 0.725490196078431;

  line1.strokes = strokes;

  frame1.appendChild(line1);

  return frame1;
}

function createCell(topBorder?, leftBorder?) {
  var cell = figma.createComponent();
  var frame1 = figma.createFrame();
  var frame2 = figma.createFrame();
  var line1 = topBorder;
  var text = figma.createText();

  frame2.name = 'Content';

  frame2.primaryAxisSizingMode = 'AUTO';

  changeText(text, '');

  cell.name = 'Default';

  const fills = clone(cell.fills);

  fills[0].opacity = 0.0001;
  fills[0].visible = true;

  cell.fills = fills;

  frame2.layoutMode = 'VERTICAL';

  frame1.appendChild(line1);

  frame1.locked = true;

  frame1.fills = [];
  frame2.fills = [];
  line1.rotation = -90;
  line1.y = -5000;

  frame1.resizeWithoutConstraints(100, 0.01);
  frame1.clipsContent = false;
  frame1.layoutAlign = 'STRETCH';
  frame2.layoutAlign = 'STRETCH';

  frame2.horizontalPadding = 8;
  frame2.verticalPadding = 10;
  cell.layoutMode = 'VERTICAL';

  cell.appendChild(frame1);
  cell.appendChild(frame2);
  frame2.appendChild(text);

  return cell;
}

// function createCellHeader() {
// 	var cell = figma.createComponent()
// 	cell.name = "Table/Cell/Header"
// 	return cell
// }

function createRow() {
  var row = figma.createComponent();
  row.name = 'Table/Row';
  row.clipsContent = true;

  const paint = {
    r: 0.725490196078431,
    g: 0.725490196078431,
    b: 0.725490196078431,
    a: 1,
  };

  var innerShadow: ShadowEffect = {
    type: 'INNER_SHADOW',
    color: paint,
    offset: { x: 0, y: 1 },
    radius: 0,
    visible: true,
    blendMode: 'NORMAL',
  };

  row.effects = [innerShadow];

  const fills = clone(row.fills);

  fills[0].opacity = 0.0001;
  fills[0].visible = true;

  row.fills = fills;

  return row;
}

function createTable() {
  var table = figma.createComponent();
  table.name = 'Table';

  const strokes = clone(table.strokes);
  const paint: SolidPaint = {
    type: 'SOLID',
    color: {
      r: 0.725490196078431,
      g: 0.725490196078431,
      b: 0.725490196078431,
    },
  };

  strokes[0] = paint;

  table.strokes = strokes;
  table.cornerRadius = 2;
  table.clipsContent = true;

  const fills = clone(table.fills);

  fills[0].visible = true;

  table.fills = fills;

  return table;
}

var components: any = {};

function createDefaultComponents() {
  var componentSpacing = 200;

  var page = figma.createPage();
  page.name = 'Table Creator';

  var introText = figma.createText();
  page.appendChild(introText);
  changeText(
    introText,
    'Customise the following components to create bespoke tables. Or to link using your own components go to Plugins > Table Creator > Link Components. You can move and rename the components as you wish. The only component which must exist for the plugin to work is the Cell component.',
  );
  introText.resizeWithoutConstraints(250, 100);

  var border = createBorder();
  components.cell = createCell(border.createInstance());
  border.remove();

  components.cell.setPluginData('isCell', 'true');

  var cellText = figma.createText();
  page.appendChild(cellText);
  changeText(
    cellText,
    'The Cell component is the only component required for Table Creator to create tables from. You can cutomise this component, or link the plugin to a different Cell component by running Plugins > Table Creator > Link Components.',
  );
  cellText.y = componentSpacing;
  cellText.x = 300;
  cellText.resizeWithoutConstraints(250, 100);

  components.cellHeader = figma.createComponent();

  var innerCell = components.cell.createInstance();

  innerCell.primaryAxisSizingMode = 'AUTO';

  components.cellHeader.appendChild(innerCell);

  // for (let i = 0; i < components.cellHeader.children.length; i++) {
  // 	components.cellHeader.children[i].primaryAxisSizingMode = "AUTO"
  // }

  components.cellHeader.name = 'Header';
  components.cellHeader.layoutMode = 'VERTICAL';
  components.cellHeader.children[0].fills = [];
  components.cellHeader.setPluginData('isCellHeader', 'true');

  changeText(
    components.cellHeader.children[0].children[1].children[0],
    null,
    'Bold',
  );

  // TODO: Needs to be aplied to user linked templates also
  components.cell.setRelaunchData({
    selectColumn: 'Select all cells in column',
    selectRow: 'Select all cells in row',
  });
  components.cellHeader.setRelaunchData({
    selectColumn: 'Select all cells in column',
    selectRow: 'Select all cells in row',
  });

  const fills = clone(components.cellHeader.fills);

  fills[0].opacity = 0.05;
  fills[0].color.r = 0;
  fills[0].color.b = 0;
  fills[0].color.g = 0;
  fills[0].visible = true;

  components.cellHeader.fills = fills;

  components.row = createRow();
  components.row.y = componentSpacing * 2;
  components.row.appendChild(components.cell.createInstance());
  components.row.appendChild(components.cell.createInstance());
  components.row.setPluginData('isRow', 'true');
  components.row.layoutMode = 'HORIZONTAL';
  components.row.counterAxisSizingMode = 'AUTO';

  var rowText = figma.createText();
  page.appendChild(rowText);
  changeText(
    rowText,
    'Only layer styles such as: background, color, border radius etc will be used for rows when creating tables.',
  );
  rowText.y = componentSpacing * 2;
  rowText.x = 300;
  rowText.resizeWithoutConstraints(250, 100);

  page.appendChild(components.row);

  components.table = createTable();
  components.table.y = componentSpacing * 3;
  var clonedRow = cloneComponentAsFrame(components.row);
  var clonedRow2 = cloneComponentAsFrame(components.row);
  components.table.appendChild(clonedRow);
  components.table.appendChild(clonedRow2);
  components.table.setPluginData('isTable', 'true');

  clonedRow.setPluginData('isRow', 'true');
  clonedRow2.setPluginData('isRow', 'true');

  components.table.layoutMode = 'VERTICAL';
  components.table.counterAxisSizingMode = 'AUTO';

  var tableText = figma.createText();
  page.appendChild(tableText);
  changeText(
    tableText,
    "Only layer styles such as: background, color, border radius etc will be used to create tables. You don't have to create tables using the plugin. You can also create tables by creating an instance of this component and detaching them. If you change the styles used on the table or row components you can update existing tables by going to Plugins > Table Creator > Link Components and select Update tables",
  );
  tableText.y = componentSpacing * 3;
  tableText.x = 300;
  tableText.resizeWithoutConstraints(250, 100);

  page.appendChild(components.cell);
  page.appendChild(components.cellHeader);
  var cellHoldingFrame = figma.combineAsVariants(
    [components.cell, components.cellHeader],
    page,
  );

  components.cell.layoutAlign = 'STRETCH';
  components.cell.primaryAxisSizingMode = 'FIXED';

  cellHoldingFrame.fills = [];
  cellHoldingFrame.itemSpacing = 16;
  cellHoldingFrame.name = 'Table/Cell';
  cellHoldingFrame.layoutMode = 'HORIZONTAL';
  cellHoldingFrame.counterAxisSizingMode = 'AUTO';
  cellHoldingFrame.y = componentSpacing * 1;

  // Bug: you need to set name first in order to set sizing mode for some reason
  innerCell.name = 'Table/Cell';
  innerCell.primaryAxisSizingMode = 'AUTO';

  page.appendChild(components.table);
  figma.root.setPluginData('ComponentPageCreated', 'true');
}

var cellID;

function findComponentById(id) {
  // var pages = figma.root.children
  // var component

  // // Look through each page to see if matches node id
  // for (let i = 0; i < pages.length; i++) {

  // 	if (pages[i].findOne(node => node.id === id && node.type === "COMPONENT")) {
  // 		component = pages[i].findOne(node => node.id === id && node.type === "COMPONENT")
  // 	}

  // }

  // return component || false

  var node = figma.getNodeById(id);

  if (node) {
    if (node.parent === null || node.parent.parent === null) {
      figma.root.setPluginData('cellComponentState', 'exists');
      return false;
    } else {
      figma.root.setPluginData('cellComponentState', 'removed');
      return node;
    }
  } else {
    figma.root.setPluginData('cellComponentState', 'deleted');
    return null;
  }
}

const TABLE = {};
const HEADER_NAMES = {};

function createNewTable(
  numberColumns,
  numberRows,
  cellWidth,
  includeHeader,
  usingLocalComponent,
  cellAlignment,
) {
  // Get Cell Template
  var cell = findComponentById(figma.root.getPluginData('cellComponentID'));

  // cell.counterAxisSizingMode = "FIXED"
  // cell.primaryAxisSizingMode = "FIXED"

  // cell.layoutGrow = 1

  // Get Header Cell Template
  var cellHeader = findComponentById(
    figma.root.getPluginData('cellHeaderComponentID'),
  );

  // cellHeader.layoutAlign = "STRETCH"
  // cellHeader.layoutGrow = 1

  // try {
  if (!cellHeader && includeHeader) {
    // throw "No Header Cell component found";
    figma.notify('No Header Cell component found');
    return;
  }
  // }
  // catch (err) {
  // 	figma.notify("No Header Cell component found")
  // 	console.log(err);
  // }

  // Get Row Template
  var row = cloneComponentAsFrame(
    findComponentById(figma.root.getPluginData('rowComponentID')),
  );

  if (!row) {
    row = figma.createFrame();
  }

  // Remove children (we only need the container)
  removeChildren(row);

  // Get Table Template
  var table = cloneComponentAsFrame(
    findComponentById(figma.root.getPluginData('tableComponentID')),
  );

  if (!table) {
    table = figma.createFrame();
  }

  // Remove children (we only need the container)
  removeChildren(table);

  // Set autolayout
  table.layoutMode = 'VERTICAL';
  table.counterAxisSizingMode = 'AUTO';

  // Duplicated Cells and Rows
  var firstRow;

  if (usingLocalComponent) {
    if (findComponentById(figma.root.getPluginData('rowComponentID'))) {
      firstRow = findComponentById(
        figma.root.getPluginData('rowComponentID'),
      ).clone();
    } else {
      firstRow = figma.createComponent();
      firstRow.layoutMode = 'HORIZONTAL';
      firstRow.counterAxisSizingMode = 'AUTO';
      firstRow.layoutAlign = 'STRETCH';
    }

    // Remove children (we only need the container)
    removeChildren(firstRow);

    firstRow.setPluginData('isRow', 'true');

    firstRow.name = row.name;
    firstRow.layoutMode = 'HORIZONTAL';
    firstRow.primaryAxisSizingMode = 'FIXED';
    firstRow.layoutAlign = 'STRETCH';
    firstRow.counterAxisAlignItems = cellAlignment;
    row.remove();
  } else {
    firstRow = row;
    firstRow.setPluginData('isRow', 'true');
  }

  var rowHeader;

  if (includeHeader) {
    rowHeader = firstRow.clone();
    rowHeader.layoutAlign = 'STRETCH';
    rowHeader.primaryAxisSizingMode = 'FIXED';

    for (var i = 0; i < numberColumns; i++) {
      // Duplicate cell for each column and append to row
      var duplicatedCellHeader = cellHeader.createInstance();

      duplicatedCellHeader.setPluginData('isCellHeader', 'true');

      duplicatedCellHeader.resizeWithoutConstraints(
        cellWidth,
        duplicatedCellHeader.height,
      );

      duplicatedCellHeader.primaryAxisAlignItems = cellAlignment;

      if (duplicatedCellHeader.children.length === 1) {
        duplicatedCellHeader.children[0].primaryAxisAlignItems = cellAlignment;
      }

      rowHeader.appendChild(duplicatedCellHeader);
    }

    table.appendChild(rowHeader);
  }

  for (var i = 0; i < numberColumns; i++) {
    var duplicatedCell = cell.createInstance();

    duplicatedCell.setPluginData('isCell', 'true');
    // Bug: layoutAlign is not inherited when creating an instance

    duplicatedCell.layoutAlign = cell.layoutAlign;
    duplicatedCell.layoutGrow = 1;

    duplicatedCell.primaryAxisSizingMode = 'FIXED';

    duplicatedCell.primaryAxisAlignItems = cellAlignment;

    duplicatedCell.resizeWithoutConstraints(cellWidth, duplicatedCell.height);

    if (duplicatedCell.children.length === 1) {
      duplicatedCell.children[0].primaryAxisAlignItems = cellAlignment;
    }

    firstRow.appendChild(duplicatedCell);
  }

  // Duplicate row for each row and append to table
  // Easier to append cloned row and then duplicate, than remove later, hence numberRows - 1
  if (!usingLocalComponent || !includeHeader) {
    table.appendChild(firstRow);
  }

  for (let i = 0; i < numberRows - 1; i++) {
    var duplicatedRow;
    if (usingLocalComponent) {
      if (includeHeader) {
        duplicatedRow = rowHeader.createInstance();
        duplicatedRow.layoutAlign = 'STRETCH';
        duplicatedRow.primaryAxisSizingMode = 'FIXED';

        // duplicatedRow.setPluginData("isRowInstance", "true")
        // Add 1 to account for header row
        TABLE[i + 1] = {};
        for (let b = 0; b < duplicatedRow.children.length; b++) {
          // Save original layout align of component before it gets swapped
          var sizing = console.log(sizing);

          duplicatedRow.children[b].mainComponent = cell;
          // duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"
          duplicatedRow.children[b].setPluginData('isCell', 'true'); // Check

          // When main component is changed set back to what original component was
          duplicatedRow.children[b].layoutAlign = cell.layoutAlign;
          duplicatedRow.children[b].primaryAxisSizingMode = 'FIXED';

          duplicatedRow.children[b].primaryAxisAlignItems = cellAlignment;

          if (duplicatedRow.children[b].children.length === 1) {
            duplicatedRow.children[
              b
            ].children[0].primaryAxisAlignItems = cellAlignment;
          }
          const letter = String.fromCharCode('A'.charCodeAt(0) + b);
          TABLE[i + 1][letter] =
            duplicatedRow.children[b].children[1].children[0];
          // }
        }

        firstRow.remove();
      } else {
        duplicatedRow = firstRow.createInstance();
        duplicatedRow.layoutAlign = 'STRETCH';
        duplicatedRow.primaryAxisSizingMode = 'FIXED';

        // Bug: You need to swap the instances because otherwise figma API calculates the height incorrectly
        for (let b = 0; b < duplicatedRow.children.length; b++) {
          duplicatedRow.children[b].mainComponent = cell;
          // duplicatedRow.children[b].primaryAxisSizingMode = "FIXED"
          duplicatedRow.children[b].setPluginData('isCell', 'true'); // Check

          // When main component is changed set back to what original main component was
          // duplicatedRow.children[b].layoutAlign = sizing

          duplicatedRow.children[b].primaryAxisAlignItems = cellAlignment;
          if (duplicatedRow.children[b].children.length === 1) {
            duplicatedRow.children[
              b
            ].children[0].primaryAxisAlignItems = cellAlignment;
          }
          // }
        }
      }
    } else {
      duplicatedRow = firstRow.clone();
      duplicatedRow.layoutAlign = 'STRETCH';
      duplicatedRow.primaryAxisSizingMode = 'FIXED';
    }

    table.appendChild(duplicatedRow);
  }

  if (includeHeader && !usingLocalComponent) {
    row.remove();
  }

  table.resize(cellWidth * numberColumns, table.height);

  // TODO: Needs to be added to components linked by user also
  table.setPluginData('isTable', 'true');

  figma.root.setPluginData('tableId', table.id);

  return table;
}

function positionInCenter(node) {
  // Position newly created table in center of viewport
  node.x = figma.viewport.center.x - node.width / 2;
  node.y = figma.viewport.center.y - node.height / 2;
}

let nodesToUpdate = [];
let dynamicNodesToUpdate = [];
let nodesOfAggregators = [];
function traverse(node) {
  if (!node || !node.name) return;

  if (node.name.match(/{{{(.*?)}}}/g)) {
    if (node.name.match(/{{{[0-9]+-[0-9]+}}}/g)) {
      dynamicNodesToUpdate.push(node);
    } else if (AGGREGATORS.some(agg => node.name.includes(agg))) {
      nodesOfAggregators.push(node);
    } else {
      nodesToUpdate.push(node);
    }
  }
  // if (node.type === 'TEXT') {
  //   const agg = AGGREGATORS.find((aggregator) => node.name.startsWith(aggregator))
  //   if (agg) nodesOfAggregators.push(node)
  // }
  if ('children' in node) {
    // if (node.type !== 'INSTANCE') {
    for (const child of node.children) {
      traverse(child);
    }
  }
  // }
}

// traverse(figma.root) // start the traversal at the root

function getNestedNode(root, type) {
  if (root.type === type) return root;
  if ('children' in root) {
    for (const child of root.children) {
      const nestedNode = getNestedNode(child, type);
      if (nestedNode) return nestedNode;
    }
  }
  return;
}

function flattenAllChildren(root, type) {
  if (!root) return [];
  if (root.type === type) return [root];
  if ('children' in root) {
    let textChildren = [];
    for (const child of root.children) {
      const nestedNodes = flattenAllChildren(child, type);
      textChildren = textChildren.concat(nestedNodes);
    }
    return textChildren;
  }
  return [];
}

function evalExpression(a, b, operator) {
  switch (operator) {
    case '+':
      if (!isNaN(parseInt(a, 10)) && !isNaN(parseInt(b, 10))) {
        console.log(parseInt(a, 10), b);
        return parseInt(a) + parseInt(b);
      }
      return a + b;
    default:
      return a;
  }
}

function applyTransformer(transformer, colIdx) {
  const transformerTokens = transformer[0].trim().split(' ');
  for (const row of Object.keys(TABLE).splice(1)) {
    const basisCol = transformerTokens[0];
    let basisValue = '';
    if (basisCol in HEADER_NAMES) {
      basisValue = TABLE[row][HEADER_NAMES[basisCol]];
    } else {
      basisValue = TABLE[row][basisCol];
    }
    if (basisValue !== '') {
      const operator = transformerTokens[1];
      const operand = transformerTokens[2];
      TABLE[row][colIdx] = evalExpression(basisValue, operand, operator);
    }
  }
}

const columnsToUpdate = [];
function collectColumnsToUpdate(colIdx) {
  const tables = figma.root.children[0].findAll(
    node => node.getPluginData('isTable') === 'true',
  );
  const table = tables[0];
  if (table.type !== 'INSTANCE') {
    for (let x = 1; x < table.children.length; x++) {
      const colNumber = colIdx.charCodeAt(0) - 'A'.charCodeAt(0);
      const cell = table.children[x].children[colNumber];
      const text = getNestedNode(cell, 'TEXT');
      columnsToUpdate.push({ text, row: x, col: colIdx });
    }
  }
}

function parseHeaderName(name, colIdx) {
  const tokens = name.split('=');
  HEADER_NAMES[tokens[0].trim()] = colIdx;

  if (tokens.length > 1) {
    const transformer = tokens.splice(1);
    applyTransformer(transformer, colIdx);
    collectColumnsToUpdate(colIdx);
  }
  return tokens;
}

function computeTableValues() {
  var pages = figma.root.children;
  var tables;

  // TODO, rigth now we only look through first page
  tables = pages[0].findAll(node => node.getPluginData('isTable') === 'true');

  // for (let b = 0; b < tables.length; b++) {
  //   var table = tables[b];

  // TODO
  // right now, we just get the first table
  let table = tables[0];

  // Don't apply if an instance
  if (table.type !== 'INSTANCE') {
    // Skip header at first
    for (let x = 1; x < table.children.length; x++) {
      let row = table.children[x];
      TABLE[x] = {};
      if (row.children && row.getPluginData('isRow') === 'true') {
        for (let k = 0; k < row.children.length; k++) {
          var cell = row.children[k];
          const letter = String.fromCharCode('A'.charCodeAt(0) + k);
          const text = getNestedNode(cell, 'TEXT').characters;
          TABLE[x][letter] = text;
        }
      }
    }

    // Parse headers after table is parsed
    TABLE[0] = {};
    let row = table.children[0];
    for (let k = 0; k < row.children.length; k++) {
      var cell = row.children[k];
      const letter = String.fromCharCode('A'.charCodeAt(0) + k);
      const text = getNestedNode(cell, 'TEXT').characters;
      TABLE[0][letter] = text;
      if (text.trim() !== '') {
        parseHeaderName(text, letter);
      }
    }
  }
}

function addNewNodeToSelection(page, node) {
  page.selection = node;
}

function selectParallelCells() {
  var _a;
  // Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
  var regex = RegExp(/\[ignore\]/, 'g');
  var selection = figma.currentPage.selection;
  var newSelection = [];
  for (let i = 0; i < selection.length; i++) {
    var parent =
      (_a = selection[i].parent) === null || _a === void 0 ? void 0 : _a.parent;
    var children =
      parent === null || parent === void 0 ? void 0 : parent.children;
    var rowIndex = children.findIndex(x => x.id === selection[i].parent.id);
    var columnIndex = children[rowIndex].children.findIndex(
      x => x.id === selection[i].id,
    );
    for (let i = 0; i < children.length; i++) {
      if (children[i].children) {
        if (
          children[i].children[columnIndex] &&
          !regex.test(children[i].children[columnIndex].parent.name)
        ) {
          newSelection.push(clone(children[i].children[columnIndex]));
        }
      }
    }
  }
  addNewNodeToSelection(figma.currentPage, newSelection);
}

function deleteSelection() {
  for (const node of figma.currentPage.selection) {
    node.remove();
  }
}

function updateDynamicNodes(nodes) {
  nodes.forEach(node => {
    console.log('name', node.name);
    let tableIndexers = node.name.match(/{{{[0-9]+-[0-9]+}}}/g);
    if (!tableIndexers || tableIndexers.length !== 1) return;

    tableIndexers = tableIndexers[0].replace('{{{', '').replace('}}}', '');
    const [startRow, endRow] = tableIndexers.split('-');

    // fetch the component we want to duplicate
    if (node.children.length === 0) return;
    const childComponent = node.children[0];

    // clear out all stale component instances
    const blah = node.children.slice(1);
    blah.forEach(child => {
      console.log('name getting removed', node.name);
      child.remove();
    });
    // return;

    // duplicate the component and fill in data from the table
    for (
      let rowIndex = parseInt(startRow);
      rowIndex < parseInt(endRow) + 1;
      ++rowIndex
    ) {
      let nextChildInstance;
      if (rowIndex === parseInt(startRow)) nextChildInstance = childComponent;
      else {
        nextChildInstance = childComponent.clone();
        node.appendChild(nextChildInstance);
      }

      const textChildren = flattenAllChildren(nextChildInstance, 'TEXT');
      console.log(
        'doing stuff to',
        textChildren.map(child => child.name),
      );
      for (const child of textChildren) {
        if (!child || child.name.includes(':')) {
          return;
        }
        let colIndex = child.name.match(/{{{(.*?)}}}/g);
        if (!colIndex) return;
        colIndex = colIndex[0].replace('{{{', '').replace('}}}', '');
        let tableValue = '';
        if (colIndex in HEADER_NAMES) {
          tableValue = TABLE[rowIndex][HEADER_NAMES[colIndex]];
        } else {
          tableValue = TABLE[rowIndex][colIndex];
        }
        const newText = node.name.replace(/{{{.*}}}/g, tableValue);
        console.log('newText', newText);
        if (child.type === 'TEXT') {
          child.characters = newText;
        }
      }
    }
  });
}

function getCellFromRow(row, colIndex) {
  if (colIndex in HEADER_NAMES) {
    return row[HEADER_NAMES[colIndex]];
  } else {
    return row[colIndex];
  }
}

const AGGREGATORS = ['COUNT', 'SUM', 'MAX'];

function populateAggregators(nodesToUpdate) {
  for (const node of nodesToUpdate) {
    if (!node || !node.name) continue;
    const agg = AGGREGATORS.find(aggregator => node.name.includes(aggregator));
    if (!agg) continue;
    let blah = node.name.match(/{{{(.*?)}}}/g);
    if (!blah) continue;
    let column = blah[0].replace(agg, '').replace('{{{', '').replace('}}}', '');
    column = column.substring(1, column.length - 1);
    if (!agg || !column) continue;

    let val;
    switch (agg) {
      case 'COUNT':
        let count = 0;
        Object.values(TABLE)
          .splice(1)
          .forEach(row => {
            if (getCellFromRow(row, column) !== '') count += 1;
          });
        val = count;
        break;
      case 'SUM':
        let sum = 0;
        Object.values(TABLE)
          .splice(1)
          .forEach(row => {
            console.log({ column });
            const cellString = getCellFromRow(row, column);
            if (cellString !== '') {
              sum += parseInt(cellString);
            }
          });
        val = sum;
        break;
      case 'MAX':
        let max = 0;
        Object.values(TABLE)
          .splice(1)
          .forEach(row => {
            const cellString = getCellFromRow(row, column);
            if (cellString !== '') {
              max = Math.max(max, parseInt(cellString));
            }
          });
        val = max;
        break;
      default:
        break;
    }

    let aggVal = val;
    node.characters = node.name.replace(/{{{.*}}}/g, aggVal);
  }
}

var message = {
  componentsExist: false,
  cellExists: false,
  columnCount: parseInt(figma.root.getPluginData('columnCount'), 10) || 4,
  rowCount: parseInt(figma.root.getPluginData('rowCount'), 10) || 4,
  cellWidth: parseInt(figma.root.getPluginData('cellWidth'), 10) || 100,
  remember: true,
  includeHeader: true,
  columnResizing: true,
  cellAlignment: figma.root.getPluginData('cellAlignment') || 'MIN',
  templates: {
    table: {
      name: figma.root.getPluginData('tableComponentName') || '',
      state: figma.root.getPluginData('tableComponentState') || null,
    },
    row: {
      name: figma.root.getPluginData('rowComponentName') || '',
      state: figma.root.getPluginData('rowComponentState') || null,
    },
    cell: {
      name: figma.root.getPluginData('cellComponentName') || '',
      state: figma.root.getPluginData('cellComponentState') || null,
    },
    cellHeader: {
      name: figma.root.getPluginData('cellHeaderComponentName') || '',
      state: figma.root.getPluginData('cellHeaderComponentState') || null,
    },
  },
};

if (figma.root.getPluginData('remember') == 'true') message.remember = true;
if (figma.root.getPluginData('remember') == 'false') message.remember = false;
if (figma.root.getPluginData('includeHeader') == 'true')
  message.includeHeader = true;
if (figma.root.getPluginData('includeHeader') == 'false')
  message.includeHeader = false;
if (figma.root.getPluginData('columnResizing') == 'true')
  message.columnResizing = true;
if (figma.root.getPluginData('columnResizing') == 'false')
  message.columnResizing = false;

if (figma.root.getPluginData('pluginVersion') === '') {
  if (figma.root.getPluginData('cellComponentID')) {
    figma.root.setPluginData('pluginVersion', '10.0.0');
  } else {
    figma.root.setPluginData('pluginVersion', '11.0.0');
  }
}

async function tableMessageHandlerV3(msg) {
  {
    if (msg.type === 'create-components') {
      if (
        figma.root.getPluginData('ComponentPageCreated') === 'true' &&
        findComponentById(figma.root.getPluginData('cellComponentID'))
      )
        return;
      createDefaultComponents();
      figma.root.setRelaunchData({ createTable: 'Create a new table' });

      figma.root.setPluginData('cellComponentID', components.cell.id);
      figma.root.setPluginData(
        'cellHeaderComponentID',
        components.cellHeader.id,
      );
      figma.root.setPluginData('rowComponentID', components.row.id);
      figma.root.setPluginData('tableComponentID', components.table.id);

      figma.notify('Default table components created');
    }

    if (msg.type === 'replace-values') {
      computeTableValues();

      nodesToUpdate = [];
      traverse(figma.root);

      // hack it up
      // await loadFonts(nodesToUpdate)
      const fontsToLoad = nodesToUpdate.reduce((fonts, node) => {
        if (
          node.type === 'TEXT' &&
          'family' in node.fontName &&
          'style' in node.fontName &&
          fonts.every(font => {
            if (
              font.family !== node.fontName.family ||
              font.style !== node.fontName.style
            )
              return true;
            return false;
          })
        ) {
          fonts = fonts.concat([node.fontName]);
        }
        return fonts;
      }, []);

      for (let i = fontsToLoad.length - 1; i >= 0; --i) {
        await figma.loadFontAsync(fontsToLoad[i]);
      }

      // This updates all single cell references
      nodesToUpdate.forEach(node => {
        let tableIndexers = node.name.match(/{{{(.*?):[0-9]+}}}/g);
        if (!tableIndexers || tableIndexers.length !== 1) {
          return;
        }
        tableIndexers = tableIndexers[0].replace('{{{', '').replace('}}}', '');
        const [colIndex, rowIndex] = tableIndexers.split(':');

        let tableValue = '';
        if (colIndex in HEADER_NAMES) {
          tableValue = TABLE[parseInt(rowIndex)][HEADER_NAMES[colIndex]];
        } else {
          tableValue = TABLE[parseInt(rowIndex)][colIndex];
        }

        const newText = node.name.replace(/{{{.*}}}/g, tableValue);
        if (node.type === 'TEXT') {
          node.characters = newText;
        }
      });

      // Update transformed columns
      columnsToUpdate.forEach(({ text, row, col }) => {
        text.characters = TABLE[row][col].toString();
      });

      updateDynamicNodes(dynamicNodesToUpdate);

      populateAggregators(nodesOfAggregators);

      nodesToUpdate = [];
      figma.closePlugin();
    }

    if (msg.type === 'create-table') {
      //
      if (findComponentById(figma.root.getPluginData('cellComponentID'))) {
        message.componentsExist = true;

        if (msg.columnCount < 51 && msg.rowCount < 51) {
          var table = createNewTable(
            msg.columnCount,
            msg.rowCount,
            msg.cellWidth,
            msg.includeHeader,
            msg.columnResizing,
            msg.cellAlignment,
          );

          if (table) {
            figma.root.setPluginData('columnCount', msg.columnCount.toString());
            figma.root.setPluginData('rowCount', msg.rowCount.toString());
            figma.root.setPluginData('cellWidth', msg.cellWidth.toString());
            figma.root.setPluginData('remember', msg.remember.toString());
            figma.root.setPluginData(
              'includeHeader',
              msg.includeHeader.toString(),
            );
            figma.root.setPluginData(
              'columnResizing',
              msg.columnResizing.toString(),
            );
            figma.root.setPluginData('cellAlignment', msg.cellAlignment);

            if (figma.root.getPluginData('remember')) {
              message.remember = figma.root.getPluginData('remember') == 'true';
            }

            if (figma.root.getPluginData('includeHeader')) {
              message.includeHeader =
                figma.root.getPluginData('includeHeader') == 'true';
            }

            if (figma.root.getPluginData('columnResizing')) {
              message.includeHeader =
                figma.root.getPluginData('columnResizing') == 'true';
            }

            if (figma.root.getPluginData('columnCount')) {
              message.columnCount = parseInt(
                figma.root.getPluginData('columnCount'),
                10,
              );
            }

            if (figma.root.getPluginData('rowCount')) {
              message.rowCount = parseInt(
                figma.root.getPluginData('rowCount'),
                10,
              );
            }

            if (figma.root.getPluginData('cellWidth')) {
              message.rowCount = parseInt(
                figma.root.getPluginData('cellWidth'),
                10,
              );
            }

            if (figma.root.getPluginData('cellAlignment')) {
              message.cellAlignment = figma.root.getPluginData('cellAlignment');
            }

            const nodes: SceneNode[] = [];
            nodes.push(table);

            positionInCenter(table);

            figma.currentPage.selection = nodes;
            // figma.viewport.scrollAndZoomIntoView(nodes);
            figma.closePlugin();
          }
        } else {
          figma.notify('Plugin limited to max of 50 columns and rows');
        }
      } else {
        message.componentsExist = false;
        figma.notify('Cannot find Cell component');
      }
    }
    if (msg.type === 'delete-col') {
      selectParallelCells();
      deleteSelection();
      computeTableValues();
    }
  }
}

export { tableMessageHandlerV3 };
