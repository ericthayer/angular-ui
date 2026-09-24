import { Component } from '@angular/core';
import { UiButton } from './button';

@Component({
  selector: 'lib-ui-components',
  imports: [UiButton],
  template: `
    <lib-button><ng-content>UI Component Button</ng-content></lib-button>
  `,
})
export class UiComponents {
}
