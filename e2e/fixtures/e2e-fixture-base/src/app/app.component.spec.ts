import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './features/welcome.component';
import { RouterModule } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, WelcomeComponent, RouterModule.forRoot([])],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome e2e-fixture-base'
    );
  });

  it(`should have as title 'e2e-fixture-base'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.menuItems).toHaveLength(1);
  });
});
