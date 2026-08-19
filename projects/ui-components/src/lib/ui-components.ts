import { Component } from '@angular/core';

@Component({
  selector: 'lib-ui-components',
  imports: [],
  template: `
    <button class="ui-button" type="button">
      <ng-content>UI Component Button</ng-content>
    </button>
  `,
  styleUrl: './ui-components.css',
})
export class UiComponents {
}
