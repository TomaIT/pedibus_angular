import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AlertService} from './alert.service';
import {User} from '../models/user';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {Login} from '../models/login';
import {Log} from '@angular/core/testing/src/logger';
import {log} from 'util';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<Login>;
  public currentUser: Observable<Login>;

  constructor(private httpClient: HttpClient,
              private alertService: AlertService) {
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

  recovery(email: string): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/authentications/recover`, {email});
  }

}
