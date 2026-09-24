import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import type {
  SplitButtonActionItem,
  SplitButtonIconPos,
  SplitButtonItem,
  SplitButtonItemSelectEvent,
  SplitButtonSeverity,
  SplitButtonSize,
  SplitButtonVariant,
} from './split-button.types';
import { type MenuFocusTarget, computeMenuPosition, resolveFocusIndex } from './split-button.utils';

let nextId = 0;

@Component({
  selector: 'lib-split-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './split-button.html',
  styleUrls: ['./button.css', './split-button.css'],
  host: { class: 'ui-split-button' },
})
export class UiSplitButton {
  readonly label = input<string>('');
  readonly icon = input<string>();
  readonly iconPos = input<SplitButtonIconPos>('left');
  readonly model = input<readonly SplitButtonItem[]>([]);
  readonly severity = input<SplitButtonSeverity>('primary');
  readonly variant = input<SplitButtonVariant>('solid');
  readonly size = input<SplitButtonSize>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly buttonDisabled = input(false, { transform: booleanAttribute });
  readonly menuButtonDisabled = input(false, { transform: booleanAttribute });
  readonly dropdownIcon = input<string>();
  readonly ariaLabel = input<string>();
  readonly expandAriaLabel = input<string>('More options');

  readonly buttonClick = output<MouseEvent>();
  readonly dropdownClick = output<MouseEvent>();
  readonly itemSelect = output<SplitButtonItemSelectEvent>();
  readonly menuShow = output<void>();
  readonly menuHide = output<void>();

  protected readonly defaultButtonId = `ui-split-button-${nextId}`;
  protected readonly menuId = `ui-split-button-menu-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly placement = signal<'bottom' | 'top'>('bottom');

  protected readonly buttonClasses = computed<string>(() => {
    const size = this.size();
    return `ui-button ui-button--${this.severity()} ui-button--${this.variant()}${size ? ` ui-button--${size}` : ''}`;
  });

  protected readonly visibleItems = computed<readonly SplitButtonItem[]>(() =>
    this.model().filter((item) => item.visible !== false),
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly menu = viewChild.required<ElementRef<HTMLUListElement>>('menu');
  private readonly menuItems = viewChildren<ElementRef<HTMLElement>>('menuItem');

  private pendingFocus: MenuFocusTarget = 'first';
  private viewportListeners: AbortController | null = null;
  private frame = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardownViewportListeners());
  }

  /** Opens the menu programmatically. */
  show(focus: MenuFocusTarget = 'first'): void {
    const menu = this.menu().nativeElement;
    if (!menu.matches(':popover-open')) {
      this.pendingFocus = focus;
      menu.showPopover();
    }
  }

  /** Closes the menu. Focus returns to the toggle when `restoreFocus` is true. */
  hide(restoreFocus = false): void {
    const menu = this.menu().nativeElement;
    if (menu.matches(':popover-open')) {
      menu.hidePopover();
    }
    if (restoreFocus) {
      this.toggle().nativeElement.focus();
    }
  }

  protected onToggleClick(event: MouseEvent): void {
    // The native `popovertarget` invoker performs the toggle; this only records intent.
    this.pendingFocus = 'first';
    this.dropdownClick.emit(event);
  }

  protected onToggleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }

  protected onMenuToggle(event: Event): void {
    const isOpen = (event as ToggleEvent).newState === 'open';
    if (isOpen === this.open()) {
      return;
    }
    this.open.set(isOpen);
    if (isOpen) {
      this.setupViewportListeners();
      this.schedulePosition(() => this.focusItem(this.pendingFocus));
      this.menuShow.emit();
    } else {
      this.teardownViewportListeners();
      this.menuHide.emit();
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem('next', target);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem('previous', target);
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem('first');
        break;
      case 'End':
        event.preventDefault();
        this.focusItem('last');
        break;
      case 'Escape':
        event.preventDefault();
        this.hide(true);
        break;
      case 'Tab':
        this.hide();
        break;
      case ' ':
        // Anchors do not activate on Space natively; buttons do.
        if (target instanceof HTMLAnchorElement) {
          event.preventDefault();
          target.click();
        }
        break;
    }
  }

  protected selectItem(item: SplitButtonActionItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    const selection: SplitButtonItemSelectEvent = { item, originalEvent: event };
    item.command?.(selection);
    this.itemSelect.emit(selection);
    this.hide(!item.url);
  }

  private focusItem(target: MenuFocusTarget, current?: HTMLElement): void {
    const items = this.menuItems()
      .map((ref) => ref.nativeElement)
      .filter((element) => element.getAttribute('aria-disabled') !== 'true');
    const index = resolveFocusIndex(items.length, current ? items.indexOf(current) : -1, target);
    if (index >= 0) {
      items[index].focus();
    } else {
      this.menu().nativeElement.focus();
    }
  }

  private schedulePosition(afterPosition?: () => void): void {
    const view = this.document.defaultView;
    if (!view) {
      return;
    }
    view.cancelAnimationFrame(this.frame);
    this.frame = view.requestAnimationFrame(() => {
      const menu = this.menu().nativeElement;
      const position = computeMenuPosition(
        this.host.nativeElement.getBoundingClientRect(),
        menu.getBoundingClientRect(),
        { width: view.innerWidth, height: view.innerHeight },
        view.getComputedStyle(this.host.nativeElement).direction === 'rtl' ? 'rtl' : 'ltr',
      );
      menu.style.setProperty('--ui-split-button-menu-top', `${position.top}px`);
      menu.style.setProperty('--ui-split-button-menu-left', `${position.left}px`);
      menu.style.setProperty('--ui-split-button-menu-min-width', `${position.minWidth}px`);
      this.placement.set(position.placement);
      afterPosition?.();
    });
  }

  private setupViewportListeners(): void {
    const view = this.document.defaultView;
    if (!view || this.viewportListeners) {
      return;
    }
    this.viewportListeners = new AbortController();
    const options: AddEventListenerOptions = {
      capture: true,
      passive: true,
      signal: this.viewportListeners.signal,
    };
    const reposition = (): void => this.schedulePosition();
    view.addEventListener('resize', reposition, options);
    view.addEventListener('scroll', reposition, options);
  }

  private teardownViewportListeners(): void {
    this.viewportListeners?.abort();
    this.viewportListeners = null;
    this.document.defaultView?.cancelAnimationFrame(this.frame);
  }
}
