/// <reference types="jasmine" />

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the component instance', () => {
    const events$ = new Subject<NavigationEnd>();

    const routerStub = {
      events: events$.asObservable(),
    } as Router;

    const activatedRouteStub = {
      firstChild: null,
      snapshot: {
        data: {},
      },
    } as ActivatedRoute;

    const component = new AppComponent(routerStub, activatedRouteStub);

    expect(component).toBeTruthy();
  });
});
