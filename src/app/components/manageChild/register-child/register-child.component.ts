import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../../services/alert.service';
import {ChildService} from '../../../services/child.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ChildPOST, Gender} from '../../../models/child';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {StopBusService} from '../../../services/stop-bus.service';

@Component({
  selector: 'app-register-child',
  templateUrl: './register-child.component.html',
  styleUrls: ['./register-child.component.css']
})
export class RegisterChildComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  genders: Array<string>;
  outStopBuses: Array<StopBus>;
  retStopBuses: Array<StopBus>;

  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder,
              private stopBusService: StopBusService) {
    if (!this.authenticationService.isParent()) {
      this.router.navigate(['/home']);
    }
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
      birth: ['', Validators.compose(
        [
          Validators.required
        ]
      )],
      gender: ['', Validators.compose(
        [
          Validators.required
        ]
      )],
      outwardStopBus: ['', Validators.compose(
        [
          Validators.required
        ]
      )],
      returnStopBus: ['', Validators.compose(
        [
          Validators.required
        ]
      )]
    });
  }

  ngOnInit() {
    this.childService.getGenders()
      .subscribe(
        (data) => {
          this.genders = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.stopBusService.getStopBusByType(StopBusType.ourward)
      .subscribe(
        (data) => {
          this.outStopBuses = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.stopBusService.getStopBusByType(StopBusType.return)
      .subscribe(
        (data) => {
          this.retStopBuses = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.initForm();
  }

  get f() {
    return this.form.controls;
  }


  childPOSTFromForm(): ChildPOST {
    const temp = new ChildPOST();
    temp.firstname = this.f.firstname.value;
    temp.surname = this.f.surname.value;
    temp.birth = this.f.birth.value;
    temp.gender = this.f.gender.value;
    temp.idStopBusOutDef = this.f.outwardStopBus.value;
    temp.idStopBusRetDef = this.f.returnStopBus.value;
    return temp;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.childService.createChild(this.childPOSTFromForm(), this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.loading = false;
          this.alertService.success('Bambino, ' + data.firstname + ' ' + data.surname + ', aggiunto con successo.');
          this.initForm();
          this.submitted = false;
        },
        (error) => {
          this.loading = false;
          this.alertService.error(error);
        }
      );
  }
}