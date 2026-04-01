import sharp from 'sharp';
import { mkdirSync } from 'fs';

const GRID_SIZE = 3;
const TILE_SIZE = 512;
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE; // 1536

async function makeGrid() {
  mkdirSync('assets', { recursive: true });

  const composites = [];
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    composites.push({
      input: `/tmp/avatar-${i + 1}.png`,
      left: col * TILE_SIZE,
      top: row * TILE_SIZE,
    });
  }

  await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toFile('assets/grid.png');

  console.log('Grid saved to assets/grid.png');
}

makeGrid();
