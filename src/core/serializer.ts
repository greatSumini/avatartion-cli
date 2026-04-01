import { AvatarConfig } from '../types.js';
import { backgrounds } from '../data/backgrounds.js';

export function serialize(config: AvatarConfig): string {
  const buffer = new Uint8Array(9);
  buffer[0] = 0; // body, always 0
  buffer[1] = config.hair;
  buffer[2] = config.eyes;
  buffer[3] = config.mouth;
  buffer[4] = config.face;
  buffer[5] = config.outfit;
  buffer[6] = config.accessories;
  buffer[7] = config.facialHair;
  buffer[8] = backgrounds.findIndex(b => b.name === config.background);
  return Buffer.from(buffer).toString('base64');
}

export function deserialize(encoded: string): AvatarConfig {
  const buffer = new Uint8Array(Buffer.from(encoded, 'base64'));
  const bgIndex = buffer[8];
  const bg = backgrounds[bgIndex] ?? backgrounds[0];
  return {
    hair: buffer[1],
    eyes: buffer[2],
    mouth: buffer[3],
    face: buffer[4],
    outfit: buffer[5],
    accessories: buffer[6],
    facialHair: buffer[7],
    background: bg.name,
  };
}
