import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertService} from '../../../services/alert.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {MessageService} from '../../../services/message.service';
import {Message} from '../../../models/message';
import {interval} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-comunication',
  templateUrl: './comunication.component.html',
  styleUrls: ['./comunication.component.css']
})
export class ComunicationComponent implements OnInit, OnDestroy {
  pageSize = 5;
  messages: Array<Message>;
  pollingData: any;
  p = 1;


  private equals(a: Message, b: Message): boolean {
    return a.creationTime === b.creationTime &&
      a.id === b.id &&
      a.idUserFrom === a.idUserFrom &&
      a.idUserTo === b.idUserTo &&
      a.message === b.message &&
      a.readConfirm === b.readConfirm &&
      a.subject === b.subject;
  }

  private refreshMessages() {
    this.messageService.findMessageByIdUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          if (!this.messages || this.messages.length !== data.length ||
            data.filter(y => this.messages.findIndex(x => this.equals(x, y)) < 0).length > 0) {
            this.messages = data.sort((a, b) => b.creationTime - a.creationTime);
            // alert('refreshed');
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private messageService: MessageService) {
  }


  ngOnDestroy(): void {
    if (this.pollingData) {
      this.pollingData.unsubscribe();
    }
  }

  ngOnInit() {
    this.refreshMessages();
    this.pollingData = interval(environment.intervalTimePolling)
      .subscribe((data) => this.refreshMessages());
  }

  getDate(creationTime: number) {
    return new Date(creationTime).toLocaleString();
  }

  deleteMessage(a: Message) {
    this.messageService.deleteMessageById(a.id)
      .subscribe(
        (data) => {
          const index = this.messages.findIndex(x => x.id === a.id);
          if (index >= 0) {
            this.messages.splice(index, 1);
          }
          this.alertService.success('Messaggio cancellato.');
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  onChangePage(event: number) {
    this.p = event;
  }
}
