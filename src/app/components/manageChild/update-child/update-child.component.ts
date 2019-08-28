import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../../services/alert.service';
import {ChildService} from '../../../services/child.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StopBusService} from '../../../services/stop-bus.service';
import {Child, ChildPOST} from '../../../models/child';
import {StopBus, StopBusType} from '../../../models/stopbus';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-update-child',
  templateUrl: './update-child.component.html',
  styleUrls: ['./update-child.component.css']
})
export class UpdateChildComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;
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
      this.router.navigate(['/home']).catch((reason) => this.alertService.error(reason));
    }
  }

  private static getDate(date: any): Date {
    const year = Number(date.split('-')[0]);
    const month = Number(date.split('-')[1]);
    const day = Number(date.split('-')[2].split('T')[0]);
    return new Date(year, month - 1, day + 1);
  }

  initForm(child: Child) {
    if (child) {
      this.myDate.nativeElement.value = UpdateChildComponent.getDate(child.birth)
        .toISOString().split('T')[0];
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
    $('#date').datepicker({dateFormat: 'yy-mm-dd'});

    this.childService.getGenders()
      .subscribe(
        (data) => {
          this.genders = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.stopBusService.getStopBusByType(StopBusType.outward)
      .subscribe(
        (data) => {
          this.outStopBuses = data.sort((a, b) => {
            if (a.idLine === b.idLine) {
              return a.hours - b.hours;
            }
            return a.idLine.localeCompare(b.idLine);
          });
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.stopBusService.getStopBusByType(StopBusType.return)
      .subscribe(
        (data) => {
          this.retStopBuses = data.sort((a, b) => {
            if (a.idLine === b.idLine) {
              return a.hours - b.hours;
            }
            return a.idLine.localeCompare(b.idLine);
          });
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
    temp.birth = new Date(this.myDate.nativeElement.value);
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
    if (!this.myDate.nativeElement.value) {
      this.alertService.error('Data di nascita è richiesta.');
      return;
    }
    this.loading = true;
    this.childService.updateChildById(this.childPath.id, this.childPOSTFromForm())
      .subscribe(
        (data) => {
          this.loading = false;
          this.alertService.success('Bambino, ' + data.firstname + ' ' + data.surname + ', aggiornato con successo.');
        },
        (error) => {
          this.loading = false;
          this.alertService.error(error);
        }
      );
  }

  getPathLineRet() {
    if (this.retStopBuses) {
      const index = this.retStopBuses.findIndex(x => x.id === this.f.returnStopBus.value);
      if (index >= 0) {
        return this.retStopBuses[index].idLine + '_ret';
      }
    }
    return null;
  }

  getPathLineOut(): string {
    if (this.outStopBuses) {
      const index = this.outStopBuses.findIndex(x => x.id === this.f.outwardStopBus.value);
      if (index >= 0) {
        return this.outStopBuses[index].idLine + '_out';
      }
    }
    return null;
  }
}
