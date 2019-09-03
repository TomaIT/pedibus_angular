import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder,
              private userService: UserService) {
  }



  get f() {
    return this.form.controls;
  }

  form: FormGroup;
  loading = false;
  submitted = false;
  user: User;

  private static getDate(date: any): Date {
    const year = Number(date.split('-')[0]);
    const month = Number(date.split('-')[1]);
    const day = Number(date.split('-')[2].split('T')[0]);
    return new Date(year, month - 1, day + 1);
  }

  initForm() {
      this.form = this.formBuilder.group({
        firstname: ['', Validators.compose(
          [
            Validators.required,
            Validators.maxLength(64)
          ]
        )],
        surname: ['', Validators.compose(
          [
            Validators.required,
            Validators.maxLength(64)
          ]
        )],
        phoneNumber: ['', Validators.compose(
          [
            Validators.required,
            Validators.pattern('^[0-9]*$')
          ]
        )],
        street: ['', Validators.compose(
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
    this.initForm();
    this.userService.findById(this.authenticationService.currentUserValue.username)
      .subscribe(
        (user) => {
          this.user = user;
          this.changeFormValue(this.user);
          const today = new Date();
          $('#date').datepicker({
            dateFormat: 'yy-mm-dd',
            changeYear: true,
            maxDate: new Date(today.getUTCFullYear() - 18, 11, 31),
            minDate: new Date(today.getUTCFullYear() - 130, 11, 31)
          });
          this.myDate.nativeElement.value = UserProfileComponent.getDate(this.user.birth)
            .toISOString().split('T')[0];
        },
        (errorUser) => {
          this.alertService.error(errorUser);
        }
      );
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
    temp.birth = new Date(this.myDate.nativeElement.value);
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
                const saved: Login = this.authenticationService.currentUserValue;
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

  /*checkInput(event) {
    const date = event.target.value;
    console.log(date.length);
    if (date.length === 4) {
      event.target.setValue(date + '-');
    }
    if (date.length === 7) {
      event.target.setValue(date + '-');
    }
  }*/
}
