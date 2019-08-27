import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {BusRide} from '../../models/busride';
import {BusRideService} from '../../services/bus-ride.service';
import {StopBusType} from '../../models/stopbus';
import {LineEnum} from '../../models/line';
import {LineService} from '../../services/line.service';
import {PresenceBusRide} from '../../models/presencebusride';

@Component({
  selector: 'app-state-busride',
  templateUrl: './state-busride.component.html',
  styleUrls: ['./state-busride.component.css']
})
export class StateBusrideComponent implements OnInit {

  selectedLine: LineEnum;
  stopBusType: StopBusType;
  selectedData: any;
  selectedDay: number;    // (1-31)
  selectedMonth: number;  // (0-11)
  selectedYear: number;   // (yyyy)
  directions: Array<StopBusType>;
  selectedDirection: StopBusType;

  lines: Array<LineEnum>;
  idBusRide: string;
  busRide: BusRide;
  presenceBusRide: PresenceBusRide;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private busRideService: BusRideService,
              private lineService: LineService) {
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.lines = new Array<LineEnum>();
    this.directions = new Array<StopBusType>();
    this.directions.push(StopBusType.outward);
    this.directions.push(StopBusType.return);
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  onChangePath(params: ParamMap) {
    if (params.get('stopBusType') !== null && params.get('stopBusType') === 'Return') {
      this.stopBusType = StopBusType.return;
    } else {
      this.stopBusType = StopBusType.outward;
    }
    if (params.get('data') !== null && params.get('data').length === 8) {
      this.selectedDay = Number.parseInt(params.get('data').substr(0, 2), 10);
      this.selectedMonth = Number.parseInt(params.get('data').substr(2, 2), 10);
      this.selectedYear = Number.parseInt(params.get('data').substr(4, 4), 10);
    } else {  // forse servono altri controlli per la data
      this.selectedDay = (new Date()).getDate();
      this.selectedMonth = (new Date()).getMonth();
      this.selectedYear = (new Date()).getFullYear();
    }
    this.selectedData = new Date(this.selectedYear, this.selectedMonth, this.selectedDay).toISOString().split('T')[0];
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.lines = data;
          if (params.get('idLine') === null || !this.lines.map(l => l.idLine).includes(params.get('idLine'))) {
            this.selectedLine = this.lines[0];
          } else {
            this.selectedLine = this.lines.filter(l => l.idLine === params.get('idLine')).pop();
          }
          this.onChangeValues();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    // alert(this.selectedDay + '/' + this.selectedMonth + '/' + this.selectedYear);
  }

  onChangeValues() {
    this.busRideService.getBusRidesFromLineAndStopBusTypeAndData(this.selectedLine.idLine,
      this.stopBusType, this.selectedYear, this.selectedMonth, this.selectedDay)
      .subscribe(
        (data) => { this.busRide = data; },
        (error) => { this.alertService.error(error); }
      );
    this.busRideService.getPresenceAggregateFromLineAndStopBusTypeAndData(this.selectedLine.idLine,
      this.stopBusType, this.selectedYear, this.selectedMonth, this.selectedDay)
      .subscribe(
        (data) => { this.presenceBusRide = data; },
        (error) => { this.alertService.error(error); }
      );
  }

  convertMinutesToTime(hours: number): string {
    const h = Math.floor(hours / 60);
    const m = hours - (h * 60);
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }

  selectedLineChange() {
    alert(this.selectedLine.idLine + ' ' + this.selectedLine.lineName);
  }
  selectedDirectionChange() {
  }
}
