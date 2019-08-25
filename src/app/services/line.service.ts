import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Line, LineEnum} from '../models/line';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LineService {
  constructor(private httpClient: HttpClient) { }

  getLinesEnum(): Observable<Array<LineEnum>> {
    return this.httpClient.get<Array<LineEnum>>(`${environment.apiUrl}/lines`);
  }

  getLine(idLine: string): Observable<Line> {
    return this.httpClient.get<Line>(`${environment.apiUrl}/lines/${idLine}`);
  }
}
