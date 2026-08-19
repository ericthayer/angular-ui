import { readFile, writeFile } from 'node:fs/promises';
import { flattenTokenTree, type TokenTree } from './token-utils';

const TOKENS_PATH = 'projects/ui-components/src/lib/styles/design-tokens.json';
const CSS_OUTPUT_PATH = 'projects/ui-components/src/lib/styles/theme.css';

async function main(): Promise<void> {
  const source = await readFile(TOKENS_PATH, 'utf-8');
  const tokens = JSON.parse(source) as TokenTree & {
    color?: TokenTree;
    spacing?: TokenTree;
    radius?: TokenTree;
    theme?: {
      light?: TokenTree;
      dark?: TokenTree;
    };
  };

  const lines: string[] = [];
  lines.push(':root, [data-theme="light"] {');
  addTokenLines(lines, {
    ...flattenTokenTree(tokens.color ?? {}, 'ui-color'),
    ...flattenTokenTree(tokens.spacing ?? {}, 'ui-spacing'),
    ...flattenTokenTree(tokens.radius ?? {}, 'ui-radius'),
    ...flattenTokenTree(tokens.theme?.light ?? {}, 'ui'),
  });
  lines.push('}');
  lines.push('');
  lines.push('[data-theme="dark"] {');
  addTokenLines(lines, flattenTokenTree(tokens.theme?.dark ?? {}, 'ui'));
  lines.push('}');
  lines.push('');

  await writeFile(CSS_OUTPUT_PATH, `${lines.join('\n')}`, 'utf-8');
  console.log(`Generated ${CSS_OUTPUT_PATH}`);
}

function addTokenLines(lines: string[], tokenEntries: Record<string, string | number>): void {
  for (const [name, value] of Object.entries(tokenEntries)) {
    lines.push(`  --${name}: ${value};`);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
