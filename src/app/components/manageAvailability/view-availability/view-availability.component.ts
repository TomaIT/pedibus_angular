import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-view-availability',
  templateUrl: './view-availability.component.html',
  styleUrls: ['./view-availability.component.css']
})
export class ViewAvailabilityComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
  }

}
