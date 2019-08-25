import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StopBus} from '../../models/stopbus';
import {ChildService} from '../../services/child.service';
import {AlertService} from '../../services/alert.service';
import {StopBusService} from '../../services/stop-bus.service';
import {UserService} from '../../services/user.service';
import {User, UserPUT} from '../../models/user';
import {Login} from '../../models/login';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  user: User;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder,
              private userService: UserService) {
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstname: [this.user.firstname, Validators.compose(
        [
          Validators.required,
          Validators.maxLength(64)
        ]
      )],
      surname: [this.user.surname, Validators.compose(
        [
          Validators.required,
          Validators.maxLength(64)
        ]
      )],
      birth: [(new Date(this.user.birth)).toISOString().split('T')[0], Validators.compose(
        [
          Validators.required
        ]
      )],
      phoneNumber: [this.user.phoneNumber, Validators.compose(
        [
          Validators.required,
          Validators.pattern('^[0-9]*$')
        ]
      )],
      street: [this.user.street, Validators.compose(
        [
          Validators.required
        ]
      )],
      password: ['', Validators.compose(
        [
          Validators.minLength(8),
          Validators.maxLength(32),
          Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')
        ]
      )],
      verifyPassword: ['', Validators.compose(
        [
          Validators.minLength(8),
          Validators.maxLength(32),
          Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')
        ]
      )]
    });
  }

  ngOnInit() {
    const saved: Login = JSON.parse(localStorage.getItem('currentUser'));
    this.user = saved.user;
    this.initForm();
  }

  get f() {
    return this.form.controls;
  }

  checkPassword() {
    const pass = this.f.password.value;
    const conf = this.f.verifyPassword.value;

    if (pass === conf) {
      return true;
    } else {
      return false;
    }
  }

  userPUTFromForm(): UserPUT {
    const temp = new UserPUT();
    temp.firstname = this.f.firstname.value;
    temp.surname = this.f.surname.value;
    temp.birth = this.f.birth.value;
    if (this.f.password.value === '') {
      temp.password = null;
      temp.verifyPassword = null;
    } else {
      temp.password = this.f.password.value;
      temp.verifyPassword = this.f.verifyPassword.value;
    }
    temp.street = this.f.street.value;
    temp.phoneNumber = this.f.phoneNumber.value;
    return temp;
  }

  changeFormValue(user: User) {
    this.f.firstname.setValue(user.firstname);
    this.f.surname.setValue(user.surname);
    this.f.birth.setValue(user.birth);
    this.f.street.setValue(user.street);
    this.f.phoneNumber.setValue(user.phoneNumber);
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.userService.updateUser(this.authenticationService.currentUserValue.username, this.userPUTFromForm())
      .subscribe(
        (data) => {
          this.loading = false;
          this.alertService.success('Informazioni aggiornate con successo.');
          this.initForm();
          this.submitted = false;
          this.userService.findById(this.authenticationService.currentUserValue.username)
            .subscribe(
              (user) => {
                const saved: Login = JSON.parse(localStorage.getItem('currentUser'));
                saved.user = user;
                localStorage.setItem('currentUser', JSON.stringify(saved));
                this.authenticationService.setCurrentUser(saved);
                this.changeFormValue(user);
              },
              (errorUser) => {
                this.alertService.error(errorUser);
              }
            );
        },
        (error) => {
          this.loading = false;
          this.alertService.error(error);
        }
      );
  }
}
