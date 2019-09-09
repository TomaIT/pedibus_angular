import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LineEnum} from '../../models/line';
import {StopBusType} from '../../models/stopbus';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {BusRideService} from '../../services/bus-ride.service';
import {AlertService} from '../../services/alert.service';
import {StopBusService} from '../../services/stop-bus.service';
import {LineService} from '../../services/line.service';
import {BusRidePost} from '../../models/busride';

// jQuery Sign $
declare let $: any;


@Component({
  selector: 'app-create-line',
  templateUrl: './create-busride.component.html',
  styleUrls: ['./create-busride.component.css']
})
export class CreateBusrideComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;
  busRideForm: FormGroup;
  loading = false;
  submitted = false;
  lines: Array<LineEnum>;
  directions: Array<StopBusType>;
  selectedData: any;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              public authenticationService: AuthenticationService,
              private alertService: AlertService,
              private busRideService: BusRideService,
              private stopBusService: StopBusService,
              private lineService: LineService) {
  }

  ngOnInit() {
    this.directions = new Array<StopBusType>();
    const today = new Date();
    $('#date').datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: today,
      onSelect: (selDate, inst) => {
        this.selectedData = selDate;
      }
    });
    this.selectedData = today;
    this.directions.push(StopBusType.return);
    this.directions.push(StopBusType.outward);
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.lines = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.busRideForm = this.formBuilder.group({
      idLine: ['', Validators.compose(
        [
          Validators.required
        ]
      )],
      stopBusType: ['', Validators.compose(
        [
          Validators.required
        ]
      )]
    });
  }

  get f() {
    return this.busRideForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.f.invalid) {
      return;
    }
    if (!this.myDate.nativeElement.value) {
      this.alertService.error('Data di nascita è richiesta.');
      return;
    }
    this.loading = true;
    const busRide: BusRidePost = new BusRidePost();
    const busDate = new Date(this.myDate.nativeElement.value);
    busRide.day = busDate.getUTCDate();
    busRide.month = busDate.getUTCMonth();
    busRide.year = busDate.getUTCFullYear();
    busRide.idLine = this.f.idLine.value;
    busRide.stopBusType = this.f.stopBusType.value;

    this.busRideService.createBusRide(busRide)
      .subscribe(
        (data) => {
          this.alertService.success('Corsa creata');
          this.loading = false;
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }
}
