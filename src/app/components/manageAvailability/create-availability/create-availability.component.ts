import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-availability',
  templateUrl: './create-availability.component.html',
  styleUrls: ['./create-availability.component.css']
})
export class CreateAvailabilityComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
  }

}
