import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ChildService} from '../../services/child.service';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {MessageService} from '../../services/message.service';
import {Message} from '../../models/message';

@Component({
  selector: 'app-comunication',
  templateUrl: './comunication.component.html',
  styleUrls: ['./comunication.component.css']
})
export class ComunicationComponent implements OnInit {
  messages: Array<Message>;


  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private messageService: MessageService) {
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.messageService.findMessageByIdUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.messages = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getDate(creationTime: number) {
    return new Date(creationTime).toLocaleString();
  }
}
