import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Reservation, ReservationPOST, ReservationPUT} from '../models/reservation';
import {environment} from '../../environments/environment';
import {forkJoin, from, Observable} from 'rxjs';
import {Child, ChildPOST} from '../models/child';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(private httpClient: HttpClient) {
  }

  getReservationsByBusRideAndStopBus(idBusRide: string, idStopBus: string): Observable<Array<Reservation>> {
    return this.httpClient.get<Array<Reservation>>(`${environment.apiUrl}/busrides/${idBusRide}/${idStopBus}/reservations`);
  }

  getReservationsByBusRide(idBusRide: string): Observable<Array<Reservation>> {
    return this.httpClient.get<Array<Reservation>>(`${environment.apiUrl}/busrides/${idBusRide}/reservations`);
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

  updateReservationById(idReservation: string, body: ReservationPUT): Observable<Reservation> {
    return this.httpClient.put<Reservation>(`${environment.apiUrl}/reservations/${idReservation}`, body);
  }

}
