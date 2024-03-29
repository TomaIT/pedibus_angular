import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StopBus, StopBusType} from '../models/stopbus';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StopBusService {
  constructor(private httpClient: HttpClient) { }

  getStopBusByType(stopBusType: StopBusType): Observable<Array<StopBus>> {
    return this.httpClient.get<Array<StopBus>>(`${environment.apiUrl}/stopbuses/withType/${stopBusType}`);
  }

  getStobBusById(idStopBus: string): Observable<StopBus> {
    return this.httpClient.get<StopBus>(`${environment.apiUrl}/stopbuses/${idStopBus}`);
  }
}
