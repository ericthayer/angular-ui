import type { ButtonSeverity, ButtonSize } from './button';

export type SplitButtonSeverity = ButtonSeverity;
export type SplitButtonSize = ButtonSize;
/** `link` is intentionally excluded: a split affordance has no meaning on an inline link. */
export type SplitButtonVariant = 'solid' | 'outlined' | 'text';
export type SplitButtonIconPos = 'left' | 'right';

export interface SplitButtonItemCommandEvent {
  readonly item: SplitButtonActionItem;
  readonly originalEvent: Event;
}

export interface SplitButtonActionItem {
  readonly separator?: false;
  readonly label: string;
  readonly icon?: string;
  /** Renders the item as an anchor. Angular's URL sanitizer applies to the bound href. */
  readonly url?: string;
  readonly target?: '_self' | '_blank' | '_parent' | '_top';
  readonly disabled?: boolean;
  readonly visible?: boolean;
  readonly command?: (event: SplitButtonItemCommandEvent) => void;
}

export interface SplitButtonSeparator {
  readonly separator: true;
  readonly visible?: boolean;
}

export type SplitButtonItem = SplitButtonActionItem | SplitButtonSeparator;

export type SplitButtonItemSelectEvent = SplitButtonItemCommandEvent;
