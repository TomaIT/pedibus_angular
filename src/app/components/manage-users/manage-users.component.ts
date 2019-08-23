import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private router: Router) {
    if (!(this.authenticationService.isSysAdmin() || this.authenticationService.isAdmin())) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
  }

}
