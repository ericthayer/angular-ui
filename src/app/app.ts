import { Component } from '@angular/core';
import { UiComponents } from 'ui-components';

@Component({
  selector: 'app-root',
  imports: [UiComponents],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  theme: 'light' | 'dark' = 'light';

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    document.documentElement.dataset['theme'] = theme;
  }
}
