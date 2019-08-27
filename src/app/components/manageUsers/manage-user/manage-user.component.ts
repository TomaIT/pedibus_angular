import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AlertService} from '../../../services/alert.service';
import {UserService} from '../../../services/user.service';
import {Role, User} from '../../../models/user';
import {LineService} from '../../../services/line.service';
import {LineEnum} from '../../../models/line';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {
  allRoles: Array<Role>;
  linesEnum: Array<LineEnum>;
  user: User;
  roleToRemove: Role;
  roleToAdd: Role;
  idLineToRemove: string;
  idLineToAdd: string;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private userService: UserService,
              private lineService: LineService) {
    if (!(this.authenticationService.isSysAdmin() || this.authenticationService.isAdmin())) {
      this.router.navigate(['/home']).catch((reason) => this.alertService.error(reason));
    }
    this.allRoles = new Array<Role>();
    this.allRoles.push(Role.sysAdmin);
    this.allRoles.push(Role.admin);
    this.allRoles.push(Role.escort);
    this.allRoles.push(Role.parent);
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.linesEnum = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private refreshNgModel() {
    if (this.getRolesRemovable().length > 0) {
      this.roleToRemove = this.getRolesRemovable()[0];
    }
    if (this.getRolesAddable().length > 0) {
      this.roleToAdd = this.getRolesAddable()[0];
    }
    if (this.getLinesRemovable().length > 0) {
      this.idLineToRemove = this.getLinesRemovable()[0].idLine;
    }
    if (this.getLinesAddable().length > 0) {
      this.idLineToAdd = this.getLinesAddable()[0].idLine;
    }
  }

  private onChangePath(params: ParamMap) {
    const id = params.get('id');
    this.userService.findById(id)
      .subscribe(
        (data) => {
          this.user = data;
          this.refreshNgModel();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getRolesRemovable(): Array<Role> {
    if (this.user) {
      if (this.authenticationService.isSysAdmin()) {
        return this.user.roles;
      }
      let temp = this.user.roles.filter(x => x !== Role.sysAdmin);
      if (this.authenticationService.isAdmin()) {
        let isPermitted = true;
        for (const a of this.user.idLines) {
          if (this.authenticationService.idLines().findIndex(x => x === a) < 0) {
            isPermitted = false;
            break;
          }
        }
        if (!isPermitted) {
          temp = temp.filter(x => x !== Role.admin);
        }
      }
      return temp;
    }
    return null;
  }

  getRolesAddable(): Array<Role> {
    if (this.user && this.allRoles) {
      if (this.authenticationService.isSysAdmin()) {
        return this.allRoles.filter(x => this.user.roles.findIndex(y => y === x) < 0);
      }
      return this.allRoles.filter(x => this.user.roles.findIndex(y => y === x) < 0)
        .filter(x => x !== Role.sysAdmin);
    }
    return null;
  }

  getLinesRemovable(): Array<LineEnum> {
    const temp = new Array<LineEnum>();
    if (this.user && this.linesEnum) {
      for (const a of this.user.idLines) {
        if (!this.authenticationService.isSysAdmin() && this.authenticationService.isAdmin()) {
          if (this.authenticationService.idLines().findIndex(x => x === a) < 0) {
            continue;
          }
        }
        const index = this.linesEnum.findIndex(x => x.idLine === a);
        if (index >= 0) {
          temp.push(this.linesEnum[index]);
        }
      }
    }
    return temp;
  }

  getLinesAddable(): Array<LineEnum> {
    if (this.user && this.linesEnum) {
      if (this.authenticationService.isSysAdmin()) {
        return this.linesEnum.filter(x => this.user.idLines.findIndex(y => y === x.idLine) < 0);
      }
      return this.linesEnum.filter(x => this.user.idLines.findIndex(y => y === x.idLine) < 0 &&
        this.authenticationService.idLines().findIndex(y => y === x.idLine) >= 0);
    }
    return null;
  }

  removeRole() {
    this.userService.removeRole(this.user.username, this.roleToRemove)
      .subscribe(
        (data) => {
          this.user = data;
          this.refreshNgModel();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  addRole() {
    this.userService.addRole(this.user.username, this.roleToAdd)
      .subscribe(
        (data) => {
          this.user = data;
          this.refreshNgModel();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  removeLine() {
    this.userService.removeLine(this.user.username, this.idLineToRemove)
      .subscribe(
        (data) => {
          this.user = data;
          this.refreshNgModel();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  addLine() {
    this.userService.addLine(this.user.username, this.idLineToAdd)
      .subscribe(
        (data) => {
          this.user = data;
          this.refreshNgModel();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }
}
