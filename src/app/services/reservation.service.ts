import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Reservation, ReservationPOST} from '../models/reservation';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(private httpClient: HttpClient) {
  }

  getReservationsByBusRideAndStopBus(idBusRide: string, idStopBus: string): Observable<Array<Reservation>> {
    return this.httpClient.get<Array<Reservation>>(`${environment.apiUrl}/busrides/${idBusRide}/${idStopBus}/reservations`);
  }

  getReservationsByIdChild(idChild: string): Observable<Array<Reservation>> {
    return this.httpClient.get<Array<Reservation>>(`${environment.apiUrl}/children/${idChild}/reservations`);
  }

  postReservation(body: ReservationPOST): Observable<Reservation> {
    return this.httpClient.post<Reservation>(`${environment.apiUrl}/reservations`, body);
  }

  deleteReservation(idReservation: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}/reservations/${idReservation}`);
  }
}
