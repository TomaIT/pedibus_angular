import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AlertService} from "./alert.service";
import {Observable} from "rxjs";
import {Role, User} from "../models/user";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient,
              private alertService: AlertService) { }

  createUser(email: string, roles: Array<Role>): Observable<User> {
    return this.httpClient.post<User>(`${environment.apiUrl}/users`, {email, roles});
  }
}
