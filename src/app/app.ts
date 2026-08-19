import { Component } from '@angular/core';
import { UiComponents } from '../../projects/ui-components/src/lib/ui-components';

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
