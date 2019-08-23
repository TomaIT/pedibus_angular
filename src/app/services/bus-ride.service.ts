import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BusRide} from '../models/busride';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusRideService {

  constructor(private httpClient: HttpClient) { }

  getBusRidesFromStartDate(idStopBus: string, startDate: Date): Observable<Array<BusRide>> {
    return this.httpClient.get<Array<BusRide>>(`${environment.apiUrl}/busrides/${idStopBus}/${startDate}`);
  }
}
