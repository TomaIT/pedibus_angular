import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Availability, AvailabilityPOST} from '../models/availability';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  constructor(private httpClient: HttpClient) {
  }

  addAvailability(body: AvailabilityPOST): Observable<any> {
    const uri = environment.apiUrl + '/availabilities';
    return this.httpClient.post(uri, body);
  }

  getAvailabilitiesByUser(idUser: string): Observable<Array<Availability>> {
    return this.httpClient.get<Array<Availability>>(`${environment.apiUrl}/users/${idUser}/availabilities`);
  }
}
