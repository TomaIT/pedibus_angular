import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AlertService} from '../../../services/alert.service';
import {UserService} from '../../../services/user.service';
import {Role, User} from '../../../models/user';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {
  allRoles: Array<Role>;
  user: User;
  roleToRemove: Role;
  roleToAdd: Role;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private userService: UserService) {
    if (!(this.authenticationService.isSysAdmin() || this.authenticationService.isAdmin())) {
      this.router.navigate(['/home']);
    }
    this.allRoles = new Array<Role>();
    this.allRoles.push(Role.sysAdmin);
    this.allRoles.push(Role.admin);
    this.allRoles.push(Role.escort);
    this.allRoles.push(Role.parent);
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private onChangePath(params: ParamMap) {
    const id = params.get('id');
    this.userService.findById(id)
      .subscribe(
        (data) => {
          this.user = data;
          if (this.getRolesRemovable().length > 0) {
            this.roleToRemove = this.getRolesRemovable()[0];
          }
          if (this.getRolesAddable().length > 0) {
            this.roleToAdd = this.getRolesAddable()[0];
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getRolesRemovable(): Array<Role> {
    if (this.authenticationService.isSysAdmin()) {
      return this.user.roles;
    }
    return this.user.roles.filter(x => x !== Role.sysAdmin);
  }

  getRolesAddable(): Array<Role> {
    if (this.authenticationService.isSysAdmin()) {
      return this.allRoles.filter(x => this.user.roles.findIndex(y => y === x) < 0);
    }
    return this.allRoles.filter(x => this.user.roles.findIndex(y => y === x) < 0)
      .filter(x => x !== Role.sysAdmin);
  }
}
