import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const PARTS_DIR = join(REPO_ROOT, '.avatartion-ref/src/components/parts');
const DATA_DIR = join(REPO_ROOT, 'src/data');

mkdirSync(DATA_DIR, { recursive: true });

/**
 * Convert JSX SVG string to plain HTML SVG string.
 * - Remove {...props}
 * - Convert JSX numeric attribute values: width={306} -> width="306"
 * - Convert camelCase SVG attributes to kebab-case
 * - Remove JSX expression wrappers around string values: fill={"#000"} -> fill="#000"
 */
function jsxToSvg(jsxContent) {
  // Extract the SVG block (everything from <svg to </svg>)
  const svgMatch = jsxContent.match(/(<svg[\s\S]*?<\/svg>)/);
  if (!svgMatch) return null;

  let svg = svgMatch[1];

  // Remove {...props} spread
  svg = svg.replace(/\s*\{\.\.\.props\}/g, '');

  // Convert JSX expression attribute values with numbers: attr={123} -> attr="123"
  svg = svg.replace(/=\{(\d+(?:\.\d+)?)\}/g, '="$1"');

  // Convert JSX expression attribute values with strings: attr={"value"} -> attr="value"
  svg = svg.replace(/=\{"([^"]*)"\}/g, '="$1"');

  // Convert camelCase SVG attributes to kebab-case
  const camelToKebab = [
    ['strokeWidth', 'stroke-width'],
    ['strokeLinecap', 'stroke-linecap'],
    ['strokeLinejoin', 'stroke-linejoin'],
    ['strokeMiterlimit', 'stroke-miterlimit'],
    ['strokeDasharray', 'stroke-dasharray'],
    ['strokeDashoffset', 'stroke-dashoffset'],
    ['strokeOpacity', 'stroke-opacity'],
    ['fillRule', 'fill-rule'],
    ['fillOpacity', 'fill-opacity'],
    ['clipRule', 'clip-rule'],
    ['clipPath', 'clip-path'],
    ['clipPathUnits', 'clipPathUnits'],
    ['gradientUnits', 'gradientUnits'],
    ['gradientTransform', 'gradientTransform'],
    ['patternUnits', 'patternUnits'],
    ['patternTransform', 'patternTransform'],
    ['xlink:href', 'xlink:href'],
    ['xlinkHref', 'xlink:href'],
    ['className', 'class'],
  ];

  for (const [camel, kebab] of camelToKebab) {
    // Match the attribute as a whole word in JSX (followed by = or whitespace)
    const re = new RegExp(`\\b${camel}(?==)`, 'g');
    svg = svg.replace(re, kebab);
  }

  return svg.trim();
}

function readJsx(filePath) {
  return readFileSync(filePath, 'utf-8');
}

function extractSvgs(dir, fileNames) {
  return fileNames.map((name) => {
    const content = readJsx(join(dir, name));
    const svg = jsxToSvg(content);
    if (!svg) throw new Error(`Could not extract SVG from ${name}`);
    return svg;
  });
}

function writeTsArray(outputPath, varName, svgs) {
  const lines = [
    `export const ${varName}: string[] = [`,
    ...svgs.map((svg, i) => {
      // Escape backticks and backslashes
      const escaped = svg.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return `  \`${escaped}\`${i < svgs.length - 1 ? ',' : ''}`;
    }),
    '];',
    '',
  ];
  writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`Written: ${outputPath} (${svgs.length} items)`);
}

function writeTsSingle(outputPath, varName, svg) {
  const escaped = svg.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  const content = `export const ${varName}: string = \`${escaped}\`;\n`;
  writeFileSync(outputPath, content, 'utf-8');
  console.log(`Written: ${outputPath}`);
}

// Faces (Face01-Face08)
const faceFiles = Array.from({ length: 8 }, (_, i) => `Face${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'faces.ts'), 'faces', extractSvgs(join(PARTS_DIR, 'faces'), faceFiles));

// Hairs (Hair01-Hair32)
const hairFiles = Array.from({ length: 32 }, (_, i) => `Hair${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'hairs.ts'), 'hairs', extractSvgs(join(PARTS_DIR, 'hairs'), hairFiles));

// Eyes (Eye01-Eye06)
const eyeFiles = Array.from({ length: 6 }, (_, i) => `Eye${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'eyes.ts'), 'eyes', extractSvgs(join(PARTS_DIR, 'eyes'), eyeFiles));

// Mouths (Mouth01-Mouth10)
const mouthFiles = Array.from({ length: 10 }, (_, i) => `Mouth${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'mouths.ts'), 'mouths', extractSvgs(join(PARTS_DIR, 'mouths'), mouthFiles));

// Outfits (Outfit01-Outfit25)
const outfitFiles = Array.from({ length: 25 }, (_, i) => `Outfit${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'outfits.ts'), 'outfits', extractSvgs(join(PARTS_DIR, 'outfits'), outfitFiles));

// Accessories (Accessory01-Accessory10, skip Accessory11)
const accessoryFiles = Array.from({ length: 10 }, (_, i) => `Accessory${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'accessories.ts'), 'accessories', extractSvgs(join(PARTS_DIR, 'accessories'), accessoryFiles));

// FacialHairs (FacialHair01-FacialHair08, skip FacialHair09)
const facialHairFiles = Array.from({ length: 8 }, (_, i) => `FacialHair${String(i + 1).padStart(2, '0')}.jsx`);
writeTsArray(join(DATA_DIR, 'facial-hairs.ts'), 'facialHairs', extractSvgs(join(PARTS_DIR, 'facial-hair'), facialHairFiles));

// Body (single SVG)
const bodyContent = readJsx(join(PARTS_DIR, 'base/Body.jsx'));
const bodySvg = jsxToSvg(bodyContent);
if (!bodySvg) throw new Error('Could not extract Body SVG');
writeTsSingle(join(DATA_DIR, 'body.ts'), 'body', bodySvg);

// Index re-exports
const indexContent = `export { faces } from './faces.js';
export { hairs } from './hairs.js';
export { eyes } from './eyes.js';
export { mouths } from './mouths.js';
export { outfits } from './outfits.js';
export { accessories } from './accessories.js';
export { facialHairs } from './facial-hairs.js';
export { body } from './body.js';
export { backgrounds } from './backgrounds.js';
`;
writeFileSync(join(DATA_DIR, 'index.ts'), indexContent, 'utf-8');
console.log(`Written: ${join(DATA_DIR, 'index.ts')}`);

console.log('\nSVG extraction complete!');
