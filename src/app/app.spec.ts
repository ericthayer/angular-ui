import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render component library heading', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Build interfaces');
    expect(compiled.querySelector('lib-button')).toBeTruthy();
  });

  it('switches themes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.setTheme('dark');
    expect(fixture.componentInstance.theme).toBe('dark');
  });
});
