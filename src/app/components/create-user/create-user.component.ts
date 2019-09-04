import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {AlertService} from '../../services/alert.service';
import {UserService} from '../../services/user.service';
import {Role} from '../../models/user';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  exists = false;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              public authenticationService: AuthenticationService,
              private alertService: AlertService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose(
        [
          Validators.required,
          Validators.email,
          Validators.minLength(6),
          Validators.maxLength(128)
        ]
      )],
      parent: [''],
      escort: [''],
      admin: [''],
      sysAdmin: ['']
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    if (!(this.f.parent.value || this.f.escort.value || this.f.admin.value || this.f.sysAdmin.value)) {
      this.alertService.error('Almeno un ruolo deve essere selezionato.');
      return;
    }

    this.loading = true;
    const temp = new Array<Role>();
    if (this.f.parent.value) {
      temp.push(Role.parent);
    }
    if (this.f.admin.value) {
      temp.push(Role.admin);
    }
    if (this.f.escort.value) {
      temp.push(Role.escort);
    }
    if (this.f.sysAdmin.value) {
      temp.push(Role.sysAdmin);
    }
    this.userService.createUser(this.f.username.value, temp)
      .subscribe(
        (data) => {
          this.alertService.success('Utente ' + data.username + ' creato con successo.');
          this.loading = false;
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );

  }

  checkIfExists(event) {
    const username = event.target.value;
    this.userService.findById(username)
      .subscribe(
        (data) => {
          this.exists = true;
        },
        (error) => {
          if (error.toString().includes('404')) {
            this.exists = false;
          }
        }
      );
  }
}
