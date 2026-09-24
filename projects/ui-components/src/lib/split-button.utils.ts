export type MenuFocusTarget = 'first' | 'last' | 'next' | 'previous';

export interface MenuPosition {
  readonly top: number;
  readonly left: number;
  readonly minWidth: number;
  readonly placement: 'bottom' | 'top';
}

export interface MenuViewport {
  readonly width: number;
  readonly height: number;
}

const MENU_GAP = 4;

/** Resolves the next roving-focus index with wrap-around. Returns -1 for an empty list. */
export function resolveFocusIndex(count: number, current: number, target: MenuFocusTarget): number {
  if (count === 0) {
    return -1;
  }
  switch (target) {
    case 'first':
      return 0;
    case 'last':
      return count - 1;
    case 'next':
      return current < 0 ? 0 : (current + 1) % count;
    case 'previous':
      return current < 0 ? count - 1 : (current - 1 + count) % count;
  }
}

/**
 * Places the menu below the anchor, flipping above when it would overflow the viewport
 * and there is room above. Horizontal alignment follows the writing direction and is
 * clamped to the viewport.
 */
export function computeMenuPosition(
  anchor: Pick<DOMRectReadOnly, 'top' | 'bottom' | 'left' | 'right' | 'width'>,
  menu: Pick<DOMRectReadOnly, 'width' | 'height'>,
  viewport: MenuViewport,
  direction: 'ltr' | 'rtl' = 'ltr',
): MenuPosition {
  const width = Math.max(menu.width, anchor.width);
  const fitsBelow = anchor.bottom + MENU_GAP + menu.height <= viewport.height;
  const fitsAbove = anchor.top - MENU_GAP - menu.height >= 0;
  const placement = !fitsBelow && fitsAbove ? 'top' : 'bottom';
  const top = placement === 'top' ? anchor.top - MENU_GAP - menu.height : anchor.bottom + MENU_GAP;
  const preferredLeft = direction === 'rtl' ? anchor.right - width : anchor.left;
  const maxLeft = Math.max(MENU_GAP, viewport.width - width - MENU_GAP);
  const left = Math.min(Math.max(preferredLeft, MENU_GAP), maxLeft);

  return { top, left, minWidth: anchor.width, placement };
}
