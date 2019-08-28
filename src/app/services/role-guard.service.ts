import { Injectable } from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AlertService} from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    /*const expectedRole = route.data.expectedRole;
    if (!this.authenticationService.is) {
      this.router.navigate(['login']);
      return false;
    }*/
    return true;
  }
}
