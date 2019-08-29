import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MyRouterService {
  private urlWhenIsNotLogged: string;

  constructor() {
  }

  setUrlWhenIsNotLogged(route: Router) {
    if (route) {
      this.urlWhenIsNotLogged = route.url;
    }
  }

  getUrlWhenIsNotLogged(): string {
    const a = this.urlWhenIsNotLogged;
    this.urlWhenIsNotLogged = undefined;
    return a;
  }
}
