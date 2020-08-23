import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { setUpTestConnection, generateUniqueString, createAccount } from 'near-api-js/test/test-utils';
import { WalletConnection } from 'near-api-js';

import { AppComponent } from './app.component';
import { WINDOW } from './services/window.service';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let spyWindow: jasmine.SpyObj<Window>;
  let mockWindow;

  beforeAll(async function () {
    const near = await setUpTestConnection();
    const walletConnection = new WalletConnection(near, 'test');

    mockWindow = {
      accountId: 'test.near',
      contract: {
        account: createAccount(near),
        contractId: generateUniqueString('test'),
        getGreeting() {
          return 'Hello';
        },
        setGreeting() {}
      },
      walletConnection
    }
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: WINDOW,
          useValue: mockWindow
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    spyWindow = TestBed.inject(WINDOW) as jasmine.SpyObj<Window>;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('signedIn', () => {
    it('should display welcome message', () => {
      const compiled = fixture.nativeElement;
      const h1 = compiled.querySelector('main h1');

      expect(h1.textContent).toContain('Welcome to NEAR!');
    });

    it('should call the `login` method on `Sign in` action', () => {
      const btn = fixture.debugElement.query(By.css('button'));
      const spyLogin = spyOn(app, 'login');
      btn.triggerEventHandler('click', null);

      expect(spyLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('signedOut', () => {
    beforeEach(async () => {
      spyOn(spyWindow.walletConnection, 'isSignedIn').and.returnValue(true);
      spyOn(spyWindow.walletConnection, 'getAccountId').and.returnValue('test.near');
      await app.fetchGreeting();
      fixture.detectChanges();
    });

    it('should display greeting text', () => {
      const compiled = fixture.nativeElement;
      const h1 = compiled.querySelector('main h1');

      expect(h1.textContent).toContain('Hello test.near');
    });

    it('should call the `logout` method on `Sign out` action', () => {
      const btn = fixture.debugElement.query(By.css('button.link'));
      const spyLogout = spyOn(app, 'logout');
      btn.triggerEventHandler('click', null);

      expect(spyLogout).toHaveBeenCalledTimes(1);
    });

    it('should contain the current greeting value', () => {
      const input = fixture.debugElement.query(By.css('input#greeting'));

      expect(input.nativeElement.value).toBe('Hello');
    });
  });
});
