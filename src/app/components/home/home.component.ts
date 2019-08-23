import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
  }

  getName(): string {
    if (this.authenticationService.isAuthenticated()) {
      return this.authenticationService.currentUserValue.user.firstname;
    }
    return null;
  }

}
