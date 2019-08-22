import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ChildService} from '../../services/child.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StopBusService} from '../../services/stop-bus.service';
import {Child, ChildPOST} from '../../models/child';
import {StopBus, StopBusType} from '../../models/stopbus';

@Component({
  selector: 'app-update-child',
  templateUrl: './update-child.component.html',
  styleUrls: ['./update-child.component.css']
})
export class UpdateChildComponent implements OnInit {
  form: FormGroup;
  childPath: Child;
  submitted = false;
  loading = false;
  outStopBuses: Array<StopBus>;
  retStopBuses: Array<StopBus>;
  genders: Array<string>;

  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private stopBusService: StopBusService) {
    if (!this.authenticationService.isParent()) {
      this.router.navigate(['/home']);
    }
  }

  initForm(child: Child) {
    if (child) {
      this.form = this.formBuilder.group({
        firstname: [child.firstname, Validators.compose(
          [
            Validators.required,
            Validators.maxLength(64)
          ]
        )],
        surname: [child.surname, Validators.compose(
          [
            Validators.required,
            Validators.maxLength(64)
          ]
        )],
        birth: [(new Date(child.birth)).toISOString().split('T')[0], Validators.compose(
          [
            Validators.required
          ]
        )],
        gender: [child.gender, Validators.compose(
          [
            Validators.required
          ]
        )],
        outwardStopBus: [child.idStopBusOutDef, Validators.compose(
          [
            Validators.required
          ]
        )],
        returnStopBus: [child.idStopBusRetDef, Validators.compose(
          [
            Validators.required
          ]
        )]
      });
    } else {
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
    this.initForm(null);
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private onChangePath(params: ParamMap) {
    const id = params.get('id');
    this.childService.findById(id)
      .subscribe(
        (data) => {
          this.childPath = data;
          this.initForm(data);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
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
    this.childService.updateChildById(this.childPath.id, this.childPOSTFromForm())
      .subscribe(
        (data) => {
          this.loading = false;
          this.alertService.success('Bambino, ' + data.firstname + ' ' + data.surname + ', aggiunto con successo.');
        },
        (error) => {
          this.loading = false;
          this.alertService.error(error);
        }
      );
  }
}
