import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {interval, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {AuthenticationService} from './authentication.service';
import {AlertService} from './alert.service';
import {Message} from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {
  pollingData: any;
  counterMessageNotRead = 0;

  private pollCounter() {
    if (this.authenticationService.isAuthenticated()) {
      this.getCounterMessageNotRead(this.authenticationService.currentUserValue.username)
        .subscribe(
          (datai) => {
            this.counterMessageNotRead = datai;
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }

  constructor(private httpClient: HttpClient,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
    this.pollCounter();
    this.pollingData = interval(environment.intervalTimePolling)
      .subscribe((data) => this.pollCounter());
  }

  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  getCounterMessageNotRead(idUser: string): Observable<number> {
    return this.httpClient.get<number>(`${environment.apiUrl}/users/${idUser}/messages/notReadCounter`);
  }

  findMessageByIdUser(idUser: string): Observable<Array<Message>> {
    return this.httpClient.get<Array<Message>>(`${environment.apiUrl}/users/${idUser}/messages`);
  }

  deleteMessageById(idMessage: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}/messages/${idMessage}`);
  }


}
