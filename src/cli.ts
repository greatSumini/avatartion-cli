#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { randomAvatar } from './core/generator.js';
import { composeSvg } from './core/composer.js';
import { exportSvg, exportPng } from './core/exporter.js';
import { deserialize } from './core/serializer.js';
import { PART_LIMITS, AvatarConfig } from './types.js';
import { backgrounds } from './data/backgrounds.js';

const program = new Command();

program
  .name('avatartion')
  .description('Generate avatartion avatars from the command line')
  .version('1.0.0');

// generate command
program
  .command('generate', { isDefault: true })
  .description('Generate an avatar')
  .option('-o, --output <path>', 'output file path', './avatar.svg')
  .option('-f, --format <format>', 'output format: svg or png', '')
  .option('-s, --size <pixels>', 'PNG size in pixels', '512')
  .option('-b, --background <name>', 'background color (transparent|white|red|yellow|green|blue|indigo|purple|pink)')
  .option('--face <number>', 'face part number (1-8)')
  .option('--hair <number>', 'hair part number (1-32)')
  .option('--eyes <number>', 'eyes part number (1-6)')
  .option('--mouth <number>', 'mouth part number (1-10)')
  .option('--outfit <number>', 'outfit part number (1-25)')
  .option('--accessories <number>', 'accessories part number (1-10)')
  .option('--facial-hair <number>', 'facial hair part number (1-8)')
  .action(async (options) => {
    // Determine format from output extension if not explicitly set
    let format = options.format;
    if (!format) {
      const ext = path.extname(options.output).toLowerCase();
      if (ext === '.png') {
        format = 'png';
      } else {
        format = 'svg';
      }
    }

    if (format !== 'svg' && format !== 'png') {
      console.error(chalk.red(`Invalid format "${format}". Use "svg" or "png".`));
      process.exit(1);
    }

    const size = parseInt(options.size, 10);
    if (isNaN(size) || size < 1) {
      console.error(chalk.red(`Invalid size "${options.size}". Must be a positive integer.`));
      process.exit(1);
    }

    // Start with a random avatar
    const base = randomAvatar();

    // Override with any explicitly provided parts
    const partOverrides: Partial<AvatarConfig> = {};

    function parsePartOption(value: string | undefined, category: string, max: number): number | undefined {
      if (value === undefined) return undefined;
      const n = parseInt(value, 10);
      if (isNaN(n) || n < 1 || n > max) {
        console.error(chalk.red(`Invalid --${category} value "${value}". Must be between 1 and ${max}.`));
        process.exit(1);
      }
      return n;
    }

    const face = parsePartOption(options.face, 'face', PART_LIMITS.face);
    const hair = parsePartOption(options.hair, 'hair', PART_LIMITS.hair);
    const eyes = parsePartOption(options.eyes, 'eyes', PART_LIMITS.eyes);
    const mouth = parsePartOption(options.mouth, 'mouth', PART_LIMITS.mouth);
    const outfit = parsePartOption(options.outfit, 'outfit', PART_LIMITS.outfit);
    const accessories = parsePartOption(options.accessories, 'accessories', PART_LIMITS.accessories);
    const facialHair = parsePartOption(options.facialHair, 'facial-hair', PART_LIMITS.facialHair);

    if (face !== undefined) partOverrides.face = face;
    if (hair !== undefined) partOverrides.hair = hair;
    if (eyes !== undefined) partOverrides.eyes = eyes;
    if (mouth !== undefined) partOverrides.mouth = mouth;
    if (outfit !== undefined) partOverrides.outfit = outfit;
    if (accessories !== undefined) partOverrides.accessories = accessories;
    if (facialHair !== undefined) partOverrides.facialHair = facialHair;

    if (options.background !== undefined) {
      const bgNames = backgrounds.map(b => b.name);
      if (!bgNames.includes(options.background)) {
        console.error(chalk.red(`Invalid background "${options.background}". Valid options: ${bgNames.join(', ')}.`));
        process.exit(1);
      }
      partOverrides.background = options.background;
    }

    const config: AvatarConfig = { ...base, ...partOverrides };

    const svgContent = composeSvg(config);

    if (format === 'png') {
      await exportPng(svgContent, options.output, size);
    } else {
      await exportSvg(svgContent, options.output);
    }

    console.log(chalk.green(`Avatar saved to ${options.output}`));
  });

// list command
program
  .command('list')
  .description('List all part categories and their valid ranges')
  .action(() => {
    console.log('');
    console.log(chalk.bold('Category      Range'));
    console.log(chalk.dim('─────────────────────'));
    const rows: Array<[string, string]> = [
      ['face', `1-${PART_LIMITS.face}`],
      ['hair', `1-${PART_LIMITS.hair}`],
      ['eyes', `1-${PART_LIMITS.eyes}`],
      ['mouth', `1-${PART_LIMITS.mouth}`],
      ['outfit', `1-${PART_LIMITS.outfit}`],
      ['accessories', `1-${PART_LIMITS.accessories}`],
      ['facial-hair', `1-${PART_LIMITS.facialHair}`],
    ];
    for (const [cat, range] of rows) {
      console.log(`${cat.padEnd(14)}${range}`);
    }
    console.log('');
    console.log(chalk.bold('Available backgrounds:'));
    console.log(backgrounds.map(b => b.name).join(', '));
    console.log('');
  });

// decode command
program
  .command('decode <code>')
  .description('Decode a base64-encoded avatar string and print the config')
  .action((code: string) => {
    try {
      const config = deserialize(code);
      console.log('');
      console.log(chalk.bold('Avatar Config:'));
      console.log(`  face:        ${config.face}`);
      console.log(`  hair:        ${config.hair}`);
      console.log(`  eyes:        ${config.eyes}`);
      console.log(`  mouth:       ${config.mouth}`);
      console.log(`  outfit:      ${config.outfit}`);
      console.log(`  accessories: ${config.accessories}`);
      console.log(`  facial-hair: ${config.facialHair}`);
      console.log(`  background:  ${config.background}`);
      console.log('');
    } catch (err) {
      console.error(chalk.red(`Failed to decode: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
