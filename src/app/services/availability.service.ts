import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Availability} from '../models/availability';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
// TODO
  constructor(private httpClient: HttpClient) {
  }
  getAvailabilitiesByUser(idUser: string): Observable<Array<Availability>> {
    return this.httpClient.get<Array<Availability>>(`${environment.apiUrl}/users/${idUser}/availabilities`);
  }
}
