import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {AlertService} from '../../services/alert.service';
import {UserService} from '../../services/user.service';
import {Role, User} from '../../models/user';
import {interval} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, OnDestroy {

  roleSelected: Role;
  roles: Array<Role>;
  users: Array<User>;
  pollingData: any;


  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService,
              private userService: UserService) {
    if (!(this.authenticationService.isSysAdmin() || this.authenticationService.isAdmin())) {
      this.router.navigate(['/home']);
    }
    this.roles = new Array<Role>();
    this.roles.push(Role.admin);
    this.roles.push(Role.escort);
    this.roles.push(Role.parent);
    this.roles.push(Role.sysAdmin);
  }

  ngOnInit() {
    this.roleSelected = Role.parent;
    this.roleSelectedChange();
    this.pollingData = interval(environment.intervalTimePolling + 5000)
      .subscribe((data) => this.roleSelectedChange());
  }

  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  isParent(user: User): boolean {
    return user.roles.findIndex(x => x === Role.parent) >= 0;
  }

  isEscort(user: User): boolean {
    return user.roles.findIndex(x => x === Role.escort) >= 0;
  }

  isAdmin(user: User): boolean {
    return user.roles.findIndex(x => x === Role.admin) >= 0;
  }

  isSysAdmin(user: User): boolean {
    return user.roles.findIndex(x => x === Role.sysAdmin) >= 0;
  }

  roleSelectedChange() {
    if (this.roleSelected) {
      this.userService.findByRole(this.roleSelected)
        .subscribe(
          (data) => {
            this.users = data;
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }

  disableUser(a: User) {

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
