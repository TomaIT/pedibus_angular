import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Child, ChildPOST} from '../models/child';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChildService {
  constructor(private httpClient: HttpClient) {
  }

  createChild(body: ChildPOST, idUser: string): Observable<Child> {
    return this.httpClient.post<Child>(`${environment.apiUrl}/children/${idUser}`, body);
  }

  getGenders(): Observable<Array<string>> {
    return this.httpClient.get<Array<string>>(`${environment.apiUrl}/children/genders`);
  }

  getChildrenByUser(idUser: string): Observable<Array<Child>> {
    return this.httpClient.get<Array<Child>>(`${environment.apiUrl}/users/${idUser}/children`);
  }

  deleteById(idChild: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}/children/${idChild}`);
  }

  findById(idChild: string): Observable<Child> {
    return this.httpClient.get<Child>(`${environment.apiUrl}/children/${idChild}`);
  }

  updateChildById(idChild: string, body: ChildPOST): Observable<Child> {
    return this.httpClient.put<Child>(`${environment.apiUrl}/children/${idChild}`, body);
  }

  findByIdUser(idUser: string): Observable<Array<Child>> {
    return this.httpClient.get<Array<Child>>(`${environment.apiUrl}/users/${idUser}/children`);
  }
}
