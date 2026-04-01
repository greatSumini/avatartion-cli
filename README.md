![avatartion-cli](assets/grid.png)

# avatartion-cli

CLI port of [Avatartion](https://github.com/wilmerterrero/Avatartion) — generate Notion-style avatars from the command line.

## Quick Start

```sh
npm install -g avatartion-cli
```

Or use without installing:

```sh
npx avatartion-cli generate
```

## Commands

### `avatartion generate`

Generate an avatar and output it as SVG or PNG.

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--output <path>` | `-o` | `./avatar.svg` | Output file path |
| `--format <fmt>` | `-f` | auto | Output format: `svg` or `png` (auto-detected from extension) |
| `--size <px>` | `-s` | `512` | PNG output size in pixels |
| `--background <name>` | `-b` | random | Background color name |
| `--face <n>` | | random | Face index (1-8) |
| `--hair <n>` | | random | Hair index (1-32) |
| `--eyes <n>` | | random | Eyes index (1-6) |
| `--mouth <n>` | | random | Mouth index (1-10) |
| `--outfit <n>` | | random | Outfit index (1-25) |
| `--accessories <n>` | | random | Accessories index (1-10) |
| `--facial-hair <n>` | | random | Facial hair index (1-8) |

### `avatartion list`

Show available options for each part category and background names.

### `avatartion decode <string>`

Decode a shared avatar string and print the avatar configuration.

## Examples

Random avatar to stdout:

```sh
avatartion generate
```

Custom avatar with specific parts:

```sh
avatartion generate --face 3 --hair 12 --eyes 2
```

Export as PNG at 1024px:

```sh
avatartion generate --format png --size 1024 --output my-avatar.png
```

Specific background color:

```sh
avatartion generate --background blue
```

## Backgrounds

Available background names: `transparent`, `white`, `red`, `yellow`, `green`, `blue`, `indigo`, `purple`, `pink`.

## Programmatic Usage

```typescript
import { randomAvatar, composeSvg, exportPng, serialize, deserialize } from 'avatartion-cli';

// Generate a random avatar SVG string
const config = randomAvatar();
const svg = composeSvg(config);

// Customize specific parts
const custom = composeSvg({
  face: 3, hair: 12, eyes: 2, mouth: 5,
  outfit: 10, accessories: 1, facialHair: 4,
  background: 'blue',
});

// Export to file
await exportPng(svg, 'avatar.png', 1024);

// Serialize / deserialize (compatible with avatartion.com)
const code = serialize(config);
const restored = deserialize(code);
```

## Sharing

Avatars use the same encoding format as [avatartion.com](https://avatartion.com), so avatar strings can be shared and decoded across both the CLI and the website.
