import { AvatarConfig, PART_LIMITS } from '../types.js';
import { backgrounds } from '../data/backgrounds.js';

function randomInt(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

export function randomAvatar(): AvatarConfig {
  const bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  return {
    face: randomInt(PART_LIMITS.face),
    hair: randomInt(PART_LIMITS.hair),
    eyes: randomInt(PART_LIMITS.eyes),
    mouth: randomInt(PART_LIMITS.mouth),
    outfit: randomInt(PART_LIMITS.outfit),
    accessories: randomInt(PART_LIMITS.accessories),
    facialHair: randomInt(PART_LIMITS.facialHair),
    background: bg.name,
  };
}
