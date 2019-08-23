import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Reservation} from '../models/reservation';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
// TODO
  constructor(private httpClient: HttpClient) {
  }
  getReservationsByBusRideAndStopBus(idBusRide: string, idStopBus: string): Observable<Array<Reservation>> {
    return this.httpClient.get<Array<Reservation>>(`${environment.apiUrl}/busrides/${idBusRide}/${idStopBus}/reservations`);
  }
}
