export type TokenValue = {
  $type: string;
  $value: string | number;
};

export type TokenTree = Record<string, TokenTree | TokenValue>;
export type TokenDocument = Record<string, unknown>;

export function isTokenValue(value: unknown): value is TokenValue {
  return !!value && typeof value === 'object' && '$value' in value && '$type' in value;
}

export function flattenTokenTree(
  tree: TokenTree,
  prefix = '',
  target: Record<string, string | number> = {},
): Record<string, string | number> {
  for (const [key, value] of Object.entries(tree)) {
    const cssKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const path = prefix ? `${prefix}-${cssKey}` : cssKey;
    if (isTokenValue(value)) {
      target[path] = value.$value;
      continue;
    }
    flattenTokenTree(value as TokenTree, path, target);
  }
  return target;
}

export function normalizeDesignTokens(payload: unknown): TokenDocument {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Token payload must be an object.');
  }

  const tokenPayload = payload as Record<string, unknown>;

  if ('$schema' in tokenPayload || 'theme' in tokenPayload || 'color' in tokenPayload) {
    return tokenPayload;
  }

  if ('meta' in tokenPayload && 'variables' in tokenPayload) {
    const variables = tokenPayload.variables as Array<Record<string, unknown>>;
    const figmaTokens: TokenTree = {};

    for (const variable of variables) {
      const name = String(variable.name ?? '').replaceAll('/', '.');
      const value = variable.resolvedValue;
      const cssValue = toCssValue(value);
      if (!name || !cssValue) {
        continue;
      }
      setTokenValue(figmaTokens, name, { $type: 'color', $value: cssValue });
    }

    return {
      $schema: 'https://tr.designtokens.org/format/',
      theme: { light: figmaTokens },
    };
  }

  throw new Error('Unsupported token payload format.');
}

function setTokenValue(target: TokenTree, dottedPath: string, token: TokenValue): void {
  const keys = dottedPath.split('.');
  let cursor: TokenTree = target;

  for (const key of keys.slice(0, -1)) {
    if (!cursor[key] || isTokenValue(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key] as TokenTree;
  }

  cursor[keys[keys.length - 1]] = token;
}

function toCssValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value !== 'object' || !value) {
    return null;
  }

  if ('r' in value && 'g' in value && 'b' in value) {
    const red = channelToRgb((value as { r: number }).r);
    const green = channelToRgb((value as { g: number }).g);
    const blue = channelToRgb((value as { b: number }).b);
    const alpha = (value as { a?: number }).a;

    if (typeof alpha === 'number' && alpha >= 0 && alpha < 1) {
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    return `rgb(${red}, ${green}, ${blue})`;
  }

  return null;
}

function channelToRgb(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}
