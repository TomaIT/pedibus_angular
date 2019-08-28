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
  pageSize = 5;
  users: Array<User>;
  pollingData: any;
  usernameStartWith: string;
  pageOfItems: Array<any>;
  numberPageOfView = 1;
  historyPage = 1;


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

  onChangePage(pageOfItems: Array<any>) {
    const index = this.users.findIndex(x => x.username === pageOfItems[0].username);
    if (index >= 0) {
      this.historyPage = (index / this.pageSize) + 1;
    }
    this.pageOfItems = pageOfItems;
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this.pollingData)) {
      this.pollingData.unsubscribe();
    }
  }

  equals(a: User, obj: User): boolean {
    return a.username === obj.username &&
      a.enabled === obj.enabled &&
      a.accountNonLocked === obj.accountNonLocked &&
      a.accountNonExpired === obj.accountNonExpired &&
      a.credentialsNonExpired === obj.credentialsNonExpired &&
      a.firstname === obj.firstname &&
      a.surname === obj.surname &&
      a.roles.length === obj.roles.length &&
      a.roles.filter(x => obj.roles.findIndex(y => x === y) < 0).length <= 0 &&
      a.phoneNumber === obj.phoneNumber;
  }

  usernameStartWithChange() {
    this.userService.findByUsernameStartWith(this.usernameStartWith, 0, 200)
      .subscribe(
        (data) => {
          const temp = data.content.sort((a, b) => a.username.localeCompare(b.username));
          temp.forEach(x => x.roles = x.roles.sort((a, b) => a.localeCompare(b)));
          this.users = temp;
          this.numberPageOfView = this.historyPage;
         /* if (!this.users || this.users.length !== temp.length ||
            temp.filter(y => this.users.findIndex(x => this.equals(x, y)) < 0).length > 0) {
            this.users = temp;
          }*/
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
