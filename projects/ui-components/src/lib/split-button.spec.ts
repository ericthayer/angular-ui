import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSplitButton } from './split-button';
import type { SplitButtonItem, SplitButtonItemSelectEvent } from './split-button.types';
import { computeMenuPosition, resolveFocusIndex } from './split-button.utils';

@Component({
  imports: [UiSplitButton],
  template: `
    <lib-split-button
      label="Save"
      icon="icon-save"
      severity="success"
      variant="outlined"
      size="small"
      [model]="items()"
      (buttonClick)="primaryClicks = primaryClicks + 1"
      (itemSelect)="selected = $event"
      (menuShow)="shown = shown + 1"
      (menuHide)="hidden = hidden + 1"
    />
  `,
})
class TestHost {
  readonly updateCommand = jasmine.createSpy('update');
  readonly items = signal<readonly SplitButtonItem[]>([
    { label: 'Update', icon: 'icon-refresh', command: this.updateCommand },
    { label: 'Delete', disabled: true },
    { separator: true },
    { label: 'Hidden', visible: false },
    { label: 'Docs', url: 'https://primeng.dev/splitbutton', target: '_blank' },
  ]);
  primaryClicks = 0;
  shown = 0;
  hidden = 0;
  selected: SplitButtonItemSelectEvent | null = null;
}

/** Popover `toggle` events are queued as tasks and positioning runs in a rAF. */
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(() => requestAnimationFrame(() => resolve())));
}

function key(target: HTMLElement, value: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
}

describe('UiSplitButton', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let defaultButton: HTMLButtonElement;
  let toggle: HTMLButtonElement;
  let menu: HTMLUListElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('lib-split-button > button');
    [defaultButton, toggle] = Array.from(buttons) as HTMLButtonElement[];
    menu = fixture.nativeElement.querySelector('[role="menu"]');
  });

  it('shares button.css variant classes and wires menu-button ARIA', () => {
    expect(defaultButton.classList).toContain('ui-button--success');
    expect(defaultButton.classList).toContain('ui-button--outlined');
    expect(toggle.classList).toContain('ui-button--small');
    expect(defaultButton.textContent).toContain('Save');
    expect(toggle.getAttribute('aria-haspopup')).toBe('menu');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(menu.id);
    expect(toggle.getAttribute('aria-label')).toBe('More options');
    expect(menu.getAttribute('aria-labelledby')).toBe(defaultButton.id);
  });

  it('filters hidden items and renders separators and links', () => {
    const items = menu.querySelectorAll('[role="menuitem"]');
    expect(Array.from(items).map((item) => item.textContent?.trim())).toEqual(['Update', 'Delete', 'Docs']);
    expect(menu.querySelector('[role="separator"]')).toBeTruthy();
    const link = menu.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(items[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('emits buttonClick from the default action without opening the menu', async () => {
    defaultButton.click();
    await settle();
    expect(host.primaryClicks).toBe(1);
    expect(menu.matches(':popover-open')).toBeFalse();
  });

  it('opens on ArrowDown, focuses the first item, and skips disabled items', async () => {
    key(toggle, 'ArrowDown');
    await settle();
    fixture.detectChanges();

    expect(menu.matches(':popover-open')).toBeTrue();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(host.shown).toBe(1);
    expect(document.activeElement?.textContent?.trim()).toBe('Update');

    key(document.activeElement as HTMLElement, 'ArrowDown');
    expect(document.activeElement?.textContent?.trim()).toBe('Docs');
    key(document.activeElement as HTMLElement, 'ArrowDown');
    expect(document.activeElement?.textContent?.trim()).toBe('Update');
    key(document.activeElement as HTMLElement, 'End');
    expect(document.activeElement?.textContent?.trim()).toBe('Docs');
  });

  it('opens on ArrowUp focusing the last item, and Escape restores focus', async () => {
    key(toggle, 'ArrowUp');
    await settle();
    expect(document.activeElement?.textContent?.trim()).toBe('Docs');

    key(document.activeElement as HTMLElement, 'Escape');
    await settle();
    fixture.detectChanges();
    expect(menu.matches(':popover-open')).toBeFalse();
    expect(document.activeElement).toBe(toggle);
    expect(host.hidden).toBe(1);
  });

  it('runs the item command, emits itemSelect, and closes', async () => {
    toggle.click();
    await settle();
    (menu.querySelector('[role="menuitem"]') as HTMLButtonElement).click();
    await settle();

    expect(host.updateCommand).toHaveBeenCalledTimes(1);
    expect(host.selected?.item.label).toBe('Update');
    expect(menu.matches(':popover-open')).toBeFalse();
    expect(document.activeElement).toBe(toggle);
  });

  it('ignores activation of disabled items', async () => {
    toggle.click();
    await settle();
    (menu.querySelectorAll('[role="menuitem"]')[1] as HTMLButtonElement).click();

    expect(host.selected).toBeNull();
    expect(menu.matches(':popover-open')).toBeTrue();
  });
});

describe('split-button utils', () => {
  it('wraps roving focus indices', () => {
    expect(resolveFocusIndex(3, 2, 'next')).toBe(0);
    expect(resolveFocusIndex(3, 0, 'previous')).toBe(2);
    expect(resolveFocusIndex(3, -1, 'next')).toBe(0);
    expect(resolveFocusIndex(0, 0, 'first')).toBe(-1);
  });

  it('flips above the anchor when the viewport lacks room below', () => {
    const anchor = { top: 560, bottom: 600, left: 20, right: 140, width: 120 };
    const position = computeMenuPosition(anchor, { width: 160, height: 200 }, { width: 800, height: 640 });
    expect(position.placement).toBe('top');
    expect(position.top).toBe(356);
    expect(position.minWidth).toBe(120);
  });

  it('aligns to the inline end in RTL and clamps to the viewport', () => {
    const anchor = { top: 0, bottom: 40, left: 700, right: 790, width: 90 };
    const rtl = computeMenuPosition(anchor, { width: 200, height: 100 }, { width: 800, height: 600 }, 'rtl');
    expect(rtl.left).toBe(590);
    const ltr = computeMenuPosition(anchor, { width: 200, height: 100 }, { width: 800, height: 600 });
    expect(ltr.left).toBe(596);
  });
});
