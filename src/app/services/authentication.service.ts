import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AlertService} from './alert.service';
import {Role} from '../models/user';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {Login} from '../models/login';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {RoleGuardService} from './role-guard.service';
import {MyRouterService} from './my-router.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<Login>;
  public currentUser: Observable<Login>;

  constructor(private httpClient: HttpClient,
              private router: Router,
              private alertService: AlertService,
              private myRouterService: MyRouterService) {
    this.currentUserSubject = new BehaviorSubject<Login>(
      JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Login {
    return this.currentUserSubject.value;
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.myRouterService.setUrlWhenIsNotLogged(this.router);
    this.router.navigate(['/login']).catch((reason) => this.alertService.error(reason));
  }

  isAuthenticated(): boolean {
    const login = this.currentUserValue;
    if (login && login.jwtToken) {
      if (login.expiredEpochTime <= (new Date()).getTime()) {// Is Expired
        this.logout();
        this.alertService.error('Token Expired. Please Login');
        return false;
      }
      return true;
    }
    return false;
  }

  login(email: string, password: string): Observable<Login> {
    return this.httpClient.post<Login>(`${environment.apiUrl}/authentications/login`, {email, password})
      .pipe(
        map(login => {
          // login successful if there's a jwt token in the response
          if (login && login.jwtToken) {
            // alert(`${user.token}`);
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(login));
            this.currentUserSubject.next(login);
          }
          return login;
        })
      );
  }

  setCurrentUser(newValue: Login) {
    this.currentUserSubject.next(newValue);
  }

  recovery(email: string): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/authentications/recover`, {email});
  }

  isParent(): boolean {
    return this.isAuthenticated() && this.currentUserValue.user.roles.findIndex(x => x === Role.parent) >= 0;
  }

  isEscort(): boolean {
    return this.isAuthenticated() && this.currentUserValue.user.roles.findIndex(x => x === Role.escort) >= 0;
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.currentUserValue.user.roles.findIndex(x => x === Role.admin) >= 0;
  }

  isSysAdmin(): boolean {
    return this.isAuthenticated() && this.currentUserValue.user.roles.findIndex(x => x === Role.sysAdmin) >= 0;
  }

  idLines(): Array<string> {
    if (this.isAdmin()) {
      return this.currentUserValue.user.idLines;
    }
    return null;
  }

}
