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
  messages: Array<Message>;
  pollingData: any;

  private refreshMessages() {
    this.messageService.findMessageByIdUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.messages = data.sort((a, b) => b.creationTime - a.creationTime);
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
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }



  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  ngOnInit() {
    this.refreshMessages();
    this.pollingData = interval(environment.intervalTimePolling + 5000)
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
}
