import { promises as fs } from 'fs';
import sharp from 'sharp';

export async function exportSvg(svgContent: string, outputPath: string): Promise<void> {
  await fs.writeFile(outputPath, svgContent, 'utf-8');
}

export async function exportPng(svgContent: string, outputPath: string, size: number = 512): Promise<void> {
  await sharp(Buffer.from(svgContent))
    .resize(size)
    .png()
    .toFile(outputPath);
}
