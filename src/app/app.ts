import { Component } from '@angular/core';
import { UiButton } from 'ui-components';

@Component({
  selector: 'app-root',
  imports: [UiButton],
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
