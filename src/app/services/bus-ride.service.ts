import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BusRide, BusRidePUT} from '../models/busride';
import {environment} from '../../environments/environment';
import {StopBusType} from '../models/stopbus';

@Injectable({
  providedIn: 'root'
})
export class BusRideService {

  constructor(private httpClient: HttpClient) { }

  getBusRidesFromStartDate(idStopBus: string, startDate: Date): Observable<Array<BusRide>> {
    return this.httpClient.get<Array<BusRide>>(`${environment.apiUrl}/busrides/${idStopBus}/${startDate}`);
  }

  getBusRideById(idBusRide: string): Observable<BusRide> {
    return this.httpClient.get<BusRide>(`${environment.apiUrl}/busrides/${idBusRide}`);
  }

  getBusRideByLineAndDirectionAndDate(idLine: string, direction: StopBusType, year: number, month: number, day: number): Observable<BusRide> {
    return this.httpClient.get<BusRide>(`${environment.apiUrl}/busrides/${idLine}/${direction}/${year}/${month}/${day}`);
  }

  setLastStopBusInBusRide(idBusRide: string, body: BusRidePUT): Observable<BusRide> {
    return this.httpClient.put<BusRide>(`${environment.apiUrl}/busrides/${idBusRide}`, body);
  }
}
