import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../../services/alert.service';
import {ChildService} from '../../../services/child.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {ChildPOST} from '../../../models/child';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {StopBusService} from '../../../services/stop-bus.service';
import {LineEnum} from '../../../models/line';
import {LineService} from '../../../services/line.service';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-register-child',
  templateUrl: './register-child.component.html',
  styleUrls: ['./register-child.component.css']
})
export class RegisterChildComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;
  form: FormGroup;
  loading = false;
  submitted = false;
  genders: Array<string>;
  outStopBuses: Array<StopBus>;
  retStopBuses: Array<StopBus>;
  outIsChange = false;
  retIsChange = false;
  lineEnum: Array<LineEnum>;
  today: Date = new Date();
  maxDate: Date = new Date(this.today.getUTCFullYear() - 3, 11, 31);
  minDate: Date = new Date(this.today.getUTCFullYear() - 11, 11, 31);
  selectedDate: Date;


  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder,
              private stopBusService: StopBusService,
              private lineService: LineService) {
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
      gender: ['', Validators.compose(
        [
          Validators.required
        ]
      )],
      outwardLine: ['', Validators.compose(
        [Validators.required
        ]
      )],
      outwardStopBus: ['', Validators.compose(
        [
          Validators.required
        ]
      )],
      returnLine: ['', Validators.compose(
        [Validators.required
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
    $('#date').datepicker({
      dateFormat: 'yy-mm-dd',
      changeYear: true,
      maxDate: this.maxDate,
      minDate: this.minDate,
      onClose: (selDate, inst) => {
        this.selectedDate = selDate;
        this.checkInsertedDate();
      }
    });
    this.childService.getGenders()
      .subscribe(
        (data) => {
          this.genders = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.lineEnum = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    /* this.stopBusService.getStopBusByType(StopBusType.outward)
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
      );*/
    this.initForm();
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
    this.childService.createChild(this.childPOSTFromForm(), this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.loading = false;
          this.alertService.success('Bambino, ' + data.firstname + ' ' + data.surname + ', aggiunto con successo.');
          this.initForm();
          this.submitted = false;
          this.retStopBuses = undefined;
          this.outStopBuses = undefined;
          this.retIsChange = false;
          this.outIsChange = false;
        },
        (error) => {
          this.loading = false;
          this.alertService.error(error);
        }
      );
  }

  changeOut() {
    this.outIsChange = true;
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

  changeRet() {
    this.retIsChange = true;
  }

  getPathLineRet() {
    if (this.retStopBuses) {
      /*const index = this.retStopBuses.findIndex(x => x.id === this.f.returnStopBus.value);
      if (index >= 0) {
        return this.retStopBuses[index].idLine + '_ret';
      }*/
      return this.retStopBuses[0].idLine + '_ret';
    }
    return null;
  }

  changeOutLine(event) {
    const id = event.target.value;
    this.stopBusService.getStopBusByType(StopBusType.outward)
      .subscribe(
        (data) => {
          this.outStopBuses = data.filter( stop =>
            stop.idLine === id);
          this.outStopBuses.sort((a, b) =>
          a.hours - b.hours);
          this.outStopBuses.splice(this.outStopBuses.length - 1, 1);
          this.outIsChange = true;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  changeRetLine(event) {
    const id = event.target.value;
    this.stopBusService.getStopBusByType(StopBusType.return)
      .subscribe(
        (data) => {
          this.retStopBuses = data.filter( stop =>
            stop.idLine === id);
          this.retStopBuses.sort((a, b) =>
            a.hours - b.hours);
          this.retStopBuses.splice(0, 1);
          this.retIsChange = true;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  checkInsertedDate() {
    const checkvar: Date = new Date(this.selectedDate);
    if ( checkvar < this.minDate) {
      this.alertService.error('Date out of range (min exception)');
      this.myDate.nativeElement.value = this.minDate.getFullYear() + '-' + this.minDate.getMonth() + '-' + this.minDate.getDate();
      this.selectedDate = this.minDate;
    }
    if ( checkvar > this.maxDate) {
      this.alertService.error('Date out of range (max exception)');
      this.myDate.nativeElement.value = this.maxDate.getFullYear() + '-' + this.maxDate.getMonth() + '-' + this.maxDate.getDate();
      this.selectedDate = this.maxDate;
    }
  }
}
