import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {AlertService} from '../../../services/alert.service';
import {UserService} from '../../../services/user.service';
import {Role, User} from '../../../models/user';
import {interval} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  users: Array<User>;
  pollingData: any;
  usernameStartWith: string;


  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService,
              private userService: UserService) {
    if (!(this.authenticationService.isSysAdmin() || this.authenticationService.isAdmin())) {
      this.router.navigate(['/home']).catch((reason) => alertService.error(reason));
    }
  }

  ngOnInit() {
    this.usernameStartWith = '';
    this.usernameStartWithChange();
    this.pollingData = interval(environment.intervalTimePolling + 5000)
      .subscribe((data) => this.usernameStartWithChange());
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this.pollingData)) {
      this.pollingData.unsubscribe();
    }
  }

  usernameStartWithChange() {
    this.userService.findByUsernameStartWith(this.usernameStartWith)
      .subscribe(
        (data) => {
          this.users = data.sort((a, b) => a.username.localeCompare(b.username));
          this.users.forEach(x => x.roles = x.roles.sort((a, b) => a.localeCompare(b)));
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  refreshUUID(a: User) {
    this.userService.refreshUUID(a.username)
      .subscribe(
        (data) => {
          this.alertService.success('Email con UUID di registrazione inviato a ' + a.username);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  blockUser(a: User) {
    this.userService.blockUser(a.username)
      .subscribe(
        (data) => {
          this.alertService.success('Utente ' + a.username + ' è stato bloccato.');
          const index = this.users.findIndex(x => x.username === a.username);
          if (index >= 0) {
            this.users[index] = data;
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  unblockUser(a: User) {
    this.userService.unblockUser(a.username)
      .subscribe(
        (data) => {
          this.alertService.success('Utente ' + a.username + ' è stato sbloccato.');
          const index = this.users.findIndex(x => x.username === a.username);
          if (index >= 0) {
            this.users[index] = data;
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

}
