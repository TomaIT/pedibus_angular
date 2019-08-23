import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {AlertService} from '../services/alert.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      switch (err.status) {
        case 401:
          // auto logout if 401 response returned from api
          this.authenticationService.logout();
          // this.alertService.error('Token Expired.');
          this.router.navigate(['/login']);
          if (err.error && err.error.message) {
            return throwError(err.status + ') ' + err.error.message);
          }
          return throwError('Token expired. Please Login');
          break;
        case 404:
          if (err.error.message) {
            return throwError(err.status + ') ' + err.error.message);
          }
          return throwError(err.status + ') ' + err.name);
          break;
        default:
          if (err.error.message) {
            return throwError(err.status + ') ' + err.error.message);
          }
          return throwError(err.status + ') ' + err.name);
          break;
      }
    }));
  }
}
