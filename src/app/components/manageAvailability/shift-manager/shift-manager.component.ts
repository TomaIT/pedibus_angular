import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-shift-manager',
  templateUrl: './shift-manager.component.html',
  styleUrls: ['./shift-manager.component.css']
})
export class ShiftManagerComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private router: Router) {
    if (!(this.authenticationService.isAdmin() || this.authenticationService.isSysAdmin())) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
  }

}
