import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AlertService} from './alert.service';
import {Role} from '../models/user';
import {MyRouterService} from './my-router.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService,
              private myRouterService: MyRouterService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authenticationService.isAuthenticated()) {
      this.myRouterService.setUrlWhenIsNotLogged(this.router);
      this.router.navigate(['login'])
        .catch((reason) => this.alertService.error(reason));
      this.alertService.error('Please Login.');
      return false;
    }
    for (const a of route.data.rolesPermitted) {
      switch (a) {
        case Role.escort:
          if (this.authenticationService.isEscort()) {
            return true;
          }
          break;
        case Role.parent:
          if (this.authenticationService.isParent()) {
            return true;
          }
          break;
        case Role.admin:
          if (this.authenticationService.isAdmin()) {
            return true;
          }
          break;
        case Role.sysAdmin:
          if (this.authenticationService.isSysAdmin()) {
            return true;
          }
          break;
      }
    }
    this.router.navigate(['home'])
      .catch((reason) => this.alertService.error(reason));
    return false;
  }
}
