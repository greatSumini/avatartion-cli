import { AvatarConfig } from '../types.js';
import { faces, hairs, eyes, mouths, outfits, accessories, facialHairs, body } from '../data/index.js';
import { backgrounds } from '../data/backgrounds.js';

function extractSvgContent(svgString: string): string {
  // Extract inner content between opening and closing svg tags
  const match = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return match ? match[1] : '';
}

export function composeSvg(config: AvatarConfig): string {
  const bg = backgrounds.find(b => b.name === config.background);
  const bgColor = bg ? bg.value : 'transparent';

  const layers: string[] = [];

  // Background rect
  if (bgColor !== 'transparent') {
    layers.push(`  <rect width="306" height="306" fill="${bgColor}" rx="16"/>`);
  }

  // Layer order: body, outfit, face(head), hair, eyes, mouth, facial-hair, accessories
  const parts: Array<{ content: string; label: string }> = [
    { content: extractSvgContent(body), label: 'body' },
    { content: extractSvgContent(outfits[config.outfit - 1]), label: 'outfit' },
    { content: extractSvgContent(faces[config.face - 1]), label: 'face' },
    { content: extractSvgContent(hairs[config.hair - 1]), label: 'hair' },
    { content: extractSvgContent(eyes[config.eyes - 1]), label: 'eyes' },
    { content: extractSvgContent(mouths[config.mouth - 1]), label: 'mouth' },
    { content: extractSvgContent(facialHairs[config.facialHair - 1]), label: 'facial-hair' },
    { content: extractSvgContent(accessories[config.accessories - 1]), label: 'accessories' },
  ];

  for (const part of parts) {
    if (part.content.trim()) {
      layers.push(`  <g data-part="${part.label}">${part.content}</g>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="306" height="306" viewBox="0 0 306 306">\n${layers.join('\n')}\n</svg>`;
}
