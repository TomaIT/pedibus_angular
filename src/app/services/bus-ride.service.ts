import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BusRide, BusRidePost, BusRidePUT} from '../models/busride';
import {environment} from '../../environments/environment';
import {StopBusType} from '../models/stopbus';
import {PresenceBusRide} from '../models/presencebusride';

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

  setLastStopBusInBusRide(idBusRide: string, body: BusRidePUT): Observable<BusRide> {
    return this.httpClient.put<BusRide>(`${environment.apiUrl}/busrides/${idBusRide}`, body);
  }

  getBusRidesFromLineAndStopBusTypeAndData(idLine: string, stopBusType: StopBusType,
                                           year: number, month: number, day: number): Observable<BusRide> {
    return this.httpClient.get<BusRide>(
      `${environment.apiUrl}/busrides/${idLine}/${stopBusType.toString()}/${year.toString()}/${month.toString()}/${day.toString()}`);
  }

  getPresenceAggregateFromLineAndStopBusTypeAndData(idLine: string, stopBusType: StopBusType,
                                                    year: number, month: number, day: number): Observable<PresenceBusRide> {
    return this.httpClient.get<PresenceBusRide>(
      // tslint:disable-next-line:max-line-length
      `${environment.apiUrl}/aggregates/presence/${idLine}/${stopBusType.toString()}/${year.toString()}/${month.toString()}/${day.toString()}`);
  }

  deleteBusride(idBusRide: string): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/busrides/${idBusRide}`);
  }

  getDownloadableBusRideInfo(idBusRide: string): Observable<any> {
    return this.httpClient.get(`${environment.apiUrl}/busrides/${idBusRide}/downloadInfo`, { responseType: 'blob' });
  }

  createBusRide(busRide: BusRidePost): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/busrides`, busRide);
  }
  // TODO da implementare e decidere il formato
}
