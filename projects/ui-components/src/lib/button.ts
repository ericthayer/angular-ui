import { Component, Input } from '@angular/core';

export type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
export type ButtonVariant = 'solid' | 'outlined' | 'text' | 'link';
export type ButtonSize = 'small' | 'large';

@Component({
  selector: 'lib-button',
  standalone: true,
  template: `
    <button
      class="ui-button"
      [class]="'ui-button--' + severity + ' ui-button--' + variant + (size ? ' ui-button--' + size : '')"
      [attr.type]="type"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-busy]="isLoading ? 'true' : null"
      [disabled]="disabled || isLoading"
    >
      @if (isLoading) {
        <span class="ui-button__spinner" aria-hidden="true"></span>
      } @else if (icon && iconPos === 'left') {
        <span class="ui-button__icon" [class]="icon" aria-hidden="true"></span>
      }
      <span class="ui-button__label"><ng-content /></span>
      @if (!isLoading && icon && iconPos === 'right') {
        <span class="ui-button__icon" [class]="icon" aria-hidden="true"></span>
      }
    </button>
  `,
  styleUrl: './button.css',
})
export class UiButton {
  @Input() severity: ButtonSeverity = 'primary';
  @Input() variant: ButtonVariant = 'solid';
  @Input() size?: ButtonSize;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon?: string;
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() ariaLabel?: string;
  @Input() disabled = false;
  @Input('loading') isLoading = false;
}
