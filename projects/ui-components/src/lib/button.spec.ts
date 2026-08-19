import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiButton } from './button';

@Component({
  imports: [UiButton],
  template: `
    <lib-button
      severity="danger"
      variant="outlined"
      size="small"
      type="submit"
      icon="icon-save"
      iconPos="right"
      [loading]="busy"
    >
      Save
    </lib-button>
  `,
})
class TestHost {
  busy = false;
}

describe('UiButton', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the configured variant, size, type, and projected label', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.classList).toContain('ui-button--danger');
    expect(button.classList).toContain('ui-button--outlined');
    expect(button.classList).toContain('ui-button--small');
    expect(button.type).toBe('submit');
    expect(button.textContent).toContain('Save');
    expect(button.querySelector('.icon-save')).toBeTruthy();
  });

  it('disables the button and shows a busy state while loading', () => {
    const loadingFixture = TestBed.createComponent(UiButton);
    loadingFixture.componentInstance.isLoading = true;
    loadingFixture.detectChanges();
    const button: HTMLButtonElement = loadingFixture.nativeElement.querySelector('button');

    expect(button.disabled).toBeTrue();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.ui-button__spinner')).toBeTruthy();
    expect(button.querySelector('.icon-save')).toBeNull();
  });
});
