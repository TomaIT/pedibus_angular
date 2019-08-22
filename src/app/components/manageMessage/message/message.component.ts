import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../../services/alert.service';
import {ChildService} from '../../../services/child.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {StopBusService} from '../../../services/stop-bus.service';
import {MessageService} from '../../../services/message.service';
import {Message} from '../../../models/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  message: Message;

  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private messageService: MessageService) {
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private onChangePath(params: ParamMap) {
    const id = params.get('id');
    this.messageService.findById(id)
      .subscribe(
        (data) => {
          this.message = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  confirmRead() {
    this.messageService.confirmRead(this.message.id, (new Date()).getTime())
      .subscribe(
        (data) => {
          this.router.navigate(['/messages']);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }
}
