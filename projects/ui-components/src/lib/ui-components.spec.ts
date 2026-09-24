import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiComponents } from './ui-components';

describe('UiComponents', () => {
  let component: UiComponents;
  let fixture: ComponentFixture<UiComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiComponents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiComponents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a themed button', () => {
    const button = fixture.nativeElement.querySelector('button.ui-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('UI Component Button');
    expect(button.type).toBe('button');
  });

  it('should render the projected label', () => {
    expect(fixture.nativeElement.querySelector('.ui-button__label').textContent).toContain(
      'UI Component Button',
    );
  });
});
