let fs = require('fs');
const css = require('css');

// Check given inputs for filename
if (process.argv.length !== 3) {
  console.log('Give model filename as input: \nnode style-generator.js {filename}');
  return;
}

const filename = process.argv[2];

const model = readFile(filename);
parseAppDescription(model);

function parseAppDescription(model) {
  const data = JSON.parse(model);

  let stylesheet = [];
  let properties = { nodes: {}, edges: {} };

  updateHtmlCss(data);

  // Apply required fixed styles
  setFixedStyles(stylesheet, data['generalStyles']);

  // Generate stylesheet.json & properties.json for nodes and edges
  setCyStyles(data['objects'], stylesheet, properties, false);
  setCyStyles(data['relations'], stylesheet, properties);

  let path = 'assets/generated/';
  // Beautify JSON output with 2 space tabs and write to file
  writeFile(path + 'stylesheet.json', JSON.stringify(stylesheet, null, 2));
  writeFile(path + 'properties.json', JSON.stringify(properties, null, 2));
}

function updateHtmlCss(data) {
  const indexFileName = 'index.html';
  const cssFileName = 'styles.css';

  processCssFile(cssFileName, data.appPreferences.style);
  processIndexFile(indexFileName, data.appInfo);
}

function processCssFile(cssFileName, style) {
  let cssFile = readFile(cssFileName);

  let ast = css.parse(cssFile);

  for (let [key, val] of Object.entries(style)) {
    for (let [cssKey, cssVal] of Object.entries(val)) {
      updateAST(ast, key, cssKey, cssVal);
    }
  }

  cssFile = css.stringify(ast);
  writeFile(cssFileName, cssFile);
}

function processIndexFile(indexFileName, template) {
  let indexFile = readFile(indexFileName);

  // Insert name between <title>___</title>
  indexFile = indexFile.replace(/(?<=<title>)(.*?)(?=<\/title>)/, template.html_header);
  writeFile(indexFileName, indexFile);
}

function setFixedStyles(stylesheet, generalStyles) {
  generalStyles.forEach(element => {
    stylesheet.push(element);
  });
}

function setCyStyles(graphElems, stylesheet, properties, isEdge = true) {
  let s = 'node.';
  let s2 = 'nodes';
  if (isEdge) {
    s = 'edge.';
    s2 = 'edges';
  }

  for (let key in graphElems) {
    let val = graphElems[key];
    let cyStyle = { selector: s + key, style: {} };

    for (let style_key in val['style']) {
      cyStyle['style'][style_key] = val['style'][style_key];
    }
    stylesheet.push(cyStyle);
    properties[s2][key] = val['properties'];
  }
}

function readFile(filename) {
  if (typeof filename !== 'string') {
    console.log('Invalid use of function!\nread_file(filename:string)');
    return;
  }

  return fs.readFileSync(filename, 'utf8');
}

function writeFile(filename, content) {
  if (typeof filename !== 'string' || typeof content !== 'string') {
    console.log('Invalid use of function!\nwrite_file(filename:string, content:string)');
    return;
  }

  fs.writeFile(filename, content, function (err) {
    if (err) throw err;

    console.log(filename + ' written successfully!');
  });
}

// ast is abstract syntax tree for style.css file 
function updateAST(ast, cssSelector, cssKey, cssVal) {
  for (let i = 0; i < ast.stylesheet.rules.length; i++) {
    let rule = ast.stylesheet.rules[i];
    if (!rule.selectors) {
      continue;
    }
    if (rule.selectors.find(x => x.includes(cssSelector))) {
      for (let j = 0; j < rule.declarations.length; j++) {
        let decl = rule.declarations[j];
        if (decl.property === cssKey) {
          ast.stylesheet.rules[i].declarations[j].value = cssVal;
        }
      }
    }
  }
}