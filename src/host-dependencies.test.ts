import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * A host compiles the components from source, so every package they import
 * resolves from the host's node_modules. Importing only Astro, which the host
 * already has, means the host installs nothing for the design system. Path
 * aliases (`@styles/…`) resolve through the host's tsconfig, so they are
 * refused too: import the design system's own files by relative path.
 */
const ALLOWED = /^astro(?:$|\/|:)/;

const SPECIFIER = /\b(?:import|export)\s+(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|@import\s+(?:url\()?['"]([^'"]+)['"]/g;

const SOURCE = /\.(?:astro|ts|css)$/;

const root = join(import.meta.dirname, '..');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return SOURCE.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

function packageImports(source: string): string[] {
  return [...source.matchAll(SPECIFIER)]
    .map(([, from, dynamic, css]) => from ?? dynamic ?? css)
    .filter(specifier => !specifier.startsWith('.') && !specifier.startsWith('/'));
}

describe('host dependencies', () => {
  test('finds the imports to check', () => {
    expect(packageImports(`import a from 'x';\nimport { b,\n c } from "y";\nimport 'z';\nexport * from 'w';\nawait import('v');\n@import url("u");\nimport c from './local';`))
      .toEqual(['x', 'y', 'z', 'w', 'v', 'u']);
  });

  test('components import no package or path alias but Astro', () => {
    const imports = sourceFiles(join(root, 'src')).flatMap(file =>
      packageImports(readFileSync(file, 'utf8'))
        .filter(specifier => !ALLOWED.test(specifier))
        .map(specifier => `${relative(root, file)}: ${specifier}`)
    );

    expect(imports).toEqual([]);
  });
});
