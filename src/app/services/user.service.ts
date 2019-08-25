import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AlertService} from './alert.service';
import {Observable} from 'rxjs';
import {Role, User, UserPUT} from '../models/user';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient,
              private alertService: AlertService) {
  }

  createUser(email: string, roles: Array<Role>): Observable<User> {
    return this.httpClient.post<User>(`${environment.apiUrl}/users`, {email, roles});
  }

  findByRole(role: Role): Observable<Array<User>> {
    return this.httpClient.get<Array<User>>(`${environment.apiUrl}/roles/${role}/users`);
  }

  refreshUUID(idUser: string): Observable<User> {
    return this.httpClient.post<User>(`${environment.apiUrl}/users/${idUser}/uuid`, {});
  }

  blockUser(idUser: string): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}/disable`, {});
  }

  unblockUser(idUser: string): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}/undisable`, {});
  }

  findById(idUser: string): Observable<User> {
    return this.httpClient.get<User>(`${environment.apiUrl}/users/${idUser}`);
  }

  addRole(idUser: string, role: Role): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}/addRole?role=${role}`, {});
  }
  removeRole(idUser: string, role: Role): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}/removeRole?role=${role}`, {});
  }

  addLine(idUser: string, idLine: string): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}/addLine?idLine=${idLine}`, {});
  }
  removeLine(idUser: string, idLine: string): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}/removeLine?idLine=${idLine}`, {});
  }

  updateUser(idUser: string, userPUT: UserPUT): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiUrl}/users/${idUser}`, userPUT);
  }
}
