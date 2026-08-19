import { writeFile } from 'node:fs/promises';
import { normalizeDesignTokens } from './token-utils';

const apiUrl = process.env.DESIGN_TOKEN_API_URL;
const apiToken = process.env.DESIGN_TOKEN_API_TOKEN;
const apiTokenHeader = process.env.DESIGN_TOKEN_API_TOKEN_HEADER ?? 'Authorization';
const outputPath =
  process.env.DESIGN_TOKEN_OUTPUT_PATH ?? 'projects/ui-components/src/lib/styles/design-tokens.json';

if (!apiUrl) {
  throw new Error('Set DESIGN_TOKEN_API_URL before running token sync.');
}

const headers = new Headers();
if (apiToken) {
  headers.set(apiTokenHeader, apiTokenHeader === 'Authorization' ? 'Bearer ' + apiToken : apiToken);
}

async function main(): Promise<void> {
  const response = await fetch(apiUrl, { headers });
  if (!response.ok) {
    throw new Error(`Token sync failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const normalizedTokens = normalizeDesignTokens(payload);

  await writeFile(outputPath, `${JSON.stringify(normalizedTokens, null, 2)}\n`, 'utf-8');
  console.log(`Synced tokens to ${outputPath}`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
