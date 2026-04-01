import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync, unlinkSync } from 'fs';

const CLI = 'node /Users/choesumin/Desktop/dev/avatartion-cli/dist/cli.js';

function run(args: string): string {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function cleanup(...paths: string[]) {
  for (const p of paths) {
    try { unlinkSync(p); } catch {}
  }
}

describe('E2E: avatartion-cli', () => {
  // a) SVG generation
  it('generates a valid SVG file', () => {
    const out = '/tmp/e2e-test.svg';
    cleanup(out);
    run(`generate -o ${out}`);
    expect(existsSync(out)).toBe(true);
    const content = readFileSync(out, 'utf8');
    expect(content.trimStart().startsWith('<svg')).toBe(true);
    cleanup(out);
  });

  // b) PNG generation
  it('generates a valid PNG file', () => {
    const out = '/tmp/e2e-test-png.png';
    cleanup(out);
    run(`generate -f png -s 256 -o ${out}`);
    expect(existsSync(out)).toBe(true);
    const size = statSync(out).size;
    expect(size).toBeGreaterThan(100);
    cleanup(out);
  });

  // c) Custom parts (deterministic) - same parts produce identical SVG
  it('produces identical SVG when same parts are specified', () => {
    const out1 = '/tmp/e2e-test-det1.svg';
    const out2 = '/tmp/e2e-test-det2.svg';
    cleanup(out1, out2);
    const parts = '--face 1 --hair 5 --eyes 3 --mouth 4 --outfit 2 --accessories 1 --facial-hair 2 --background white';
    run(`generate ${parts} -o ${out1}`);
    run(`generate ${parts} -o ${out2}`);
    const c1 = readFileSync(out1, 'utf8');
    const c2 = readFileSync(out2, 'utf8');
    expect(c1).toBe(c2);
    cleanup(out1, out2);
  });

  // d) Validation errors
  it('exits with non-zero status for --face 99 (out of range)', () => {
    expect(() => run('generate --face 99 -o /tmp/e2e-err1.svg')).toThrow();
  });

  it('exits with non-zero status for --face 0 (below range)', () => {
    expect(() => run('generate --face 0 -o /tmp/e2e-err2.svg')).toThrow();
  });

  it('exits with non-zero status for invalid background', () => {
    expect(() => run('generate -b invalid -o /tmp/e2e-err3.svg')).toThrow();
  });

  // e) List command
  it('list command outputs all part categories', () => {
    const output = run('list');
    expect(output).toContain('face');
    expect(output).toContain('hair');
    expect(output).toContain('eyes');
    expect(output).toContain('mouth');
    expect(output).toContain('outfit');
    expect(output).toContain('accessories');
    expect(output).toContain('facial-hair');
  });

  // f) Decode command - known base64 string
  // Buffer: [0(body), 2(hair), 3(eyes), 4(mouth), 1(face), 5(outfit), 6(accessories), 7(facialHair), 0(bgIndex=transparent)]
  // base64: AAIDBAEFBgcA
  it('decode command outputs expected values for known base64', () => {
    const output = run('decode AAIDBAEFBgcA');
    expect(output).toContain('face:');
    expect(output).toContain('1');
    expect(output).toContain('hair:');
    expect(output).toContain('2');
    expect(output).toContain('eyes:');
    expect(output).toContain('3');
    expect(output).toContain('background:');
    expect(output).toContain('transparent');
  });

  // g) Format auto-detection via file extension
  it('auto-detects PNG format from .png extension', () => {
    const out = '/tmp/test-auto.png';
    cleanup(out);
    run(`generate -o ${out}`);
    expect(existsSync(out)).toBe(true);
    const size = statSync(out).size;
    expect(size).toBeGreaterThan(100);
    // Verify PNG magic bytes
    const buf = readFileSync(out);
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50); // P
    expect(buf[2]).toBe(0x4e); // N
    expect(buf[3]).toBe(0x47); // G
    cleanup(out);
  });

  it('auto-detects SVG format from .svg extension', () => {
    const out = '/tmp/test-auto.svg';
    cleanup(out);
    run(`generate -o ${out}`);
    expect(existsSync(out)).toBe(true);
    const content = readFileSync(out, 'utf8');
    expect(content.trimStart().startsWith('<svg')).toBe(true);
    cleanup(out);
  });
});
