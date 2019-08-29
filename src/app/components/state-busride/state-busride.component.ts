import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {BusRide} from '../../models/busride';
import {BusRideService} from '../../services/bus-ride.service';
import {StopBusType} from '../../models/stopbus';
import {LineEnum} from '../../models/line';
import {LineService} from '../../services/line.service';
import {PresenceBusRide, PresenceChild, PresenceStopBus} from '../../models/presencebusride';
import {interval} from 'rxjs';
import {environment} from '../../../environments/environment';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-state-busride',
  templateUrl: './state-busride.component.html',
  styleUrls: ['./state-busride.component.css']
})
export class StateBusrideComponent implements OnInit, OnDestroy {
  @ViewChild('myDate', { static: true }) myDate: ElementRef;
  selectedLine: LineEnum;
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

  pollingData: any;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private busRideService: BusRideService,
              private lineService: LineService) {
  }

  ngOnInit() {
    $('#date').datepicker({
      dateFormat: 'yy-mm-dd',
      onSelect: (selDate, inst) => {
        this.selectedData = selDate;
        this.selectedDataChange();
      }
    });
    this.busRide = new BusRide();
    this.presenceBusRide = new PresenceBusRide();
    this.presenceBusRide.presenceStopBusGETTreeSet = new Array<PresenceStopBus>();
    this.presenceBusRide.presenceStopBusGETTreeSet.forEach(p => p.presenceChildGETSet = new Array<PresenceChild>());
    this.lines = new Array<LineEnum>();
    this.directions = new Array<StopBusType>();
    this.directions.push(StopBusType.outward);
    this.directions.push(StopBusType.return);
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
    this.pollingData = interval(environment.intervalTimePolling + 5000)
      .subscribe((data) => this.refreshBusRideAndPresences());
  }
  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  onChangePath(params: ParamMap) {
    let reload = false;
    if (params.get('stopBusType') === 'Return') {
      this.selectedDirection = StopBusType.return;
    } else {
      if (params.get('stopBusType') === 'Outward') {
        this.selectedDirection = StopBusType.outward;
      } else {
        this.selectedDirection = StopBusType.outward;
        reload = true;
      }
    }
    if (params.get('data') !== null && params.get('data').length === 8) {
      this.selectedYear = Number.parseInt(params.get('data').substr(0, 4), 10);
      this.selectedMonth = Number.parseInt(params.get('data').substr(4, 2), 10);
      this.selectedDay = Number.parseInt(params.get('data').substr(6, 2), 10);
      this.selectedData = new Date(this.selectedYear, this.selectedMonth, this.selectedDay + 1).toISOString().split('T')[0];
    } else {  // forse servono altri controlli per la data
      this.selectedDay = (new Date()).getDate();
      this.selectedMonth = (new Date()).getMonth();
      this.selectedYear = (new Date()).getFullYear();
      this.selectedData = new Date().toISOString().split('T')[0];
      reload = true;
    }
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.lines = data;
          if (params.get('idLine') === null || !this.lines.map(l => l.idLine).includes(params.get('idLine'))) {
            this.selectedLine = this.lines[0];
            reload = true;
          } else {
            this.selectedLine = this.lines.filter(l => l.idLine === params.get('idLine')).pop();
          }
          if (reload) {
            this.reloadWithNewPath();
          }
          this.refreshBusRideAndPresences();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    // alert(this.selectedDay + '/' + this.selectedMonth + '/' + this.selectedYear);
  }

  private refreshBusRideAndPresences() {
    this.busRideService.getBusRidesFromLineAndStopBusTypeAndData(this.selectedLine.idLine,
      this.selectedDirection, this.selectedYear, this.selectedMonth, this.selectedDay)
      .subscribe(
        (data) => { this.busRide = data; },
        (error) => { this.alertService.error(error); }
      );
    this.busRideService.getPresenceAggregateFromLineAndStopBusTypeAndData(this.selectedLine.idLine,
      this.selectedDirection, this.selectedYear, this.selectedMonth, this.selectedDay)
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
    this.reloadWithNewPath();
  }
  selectedDirectionChange() {
    this.reloadWithNewPath();
  }

  selectedDataChange() {
    const temp = new Date(this.selectedData);
    this.selectedDay = temp.getDate();
    this.selectedMonth = temp.getMonth();
    this.selectedYear = temp.getFullYear();
    this.reloadWithNewPath();
  }

  reloadWithNewPath() {
    const strData = ('0' + this.selectedYear).slice(-4) + ('0' + this.selectedMonth).slice(-2) + ('0' + this.selectedDay).slice(-2);
    this.router.navigate(
      [`/stateBusRide/${this.selectedLine.idLine}/${this.selectedDirection}/${strData}`]);
  }

  isBusAlreadyPassed(idStopBus: string): boolean {
    const idStopBuses = this.busRide.stopBuses.map(x => x.id);
    if (idStopBuses.indexOf(idStopBus) <= idStopBuses.indexOf(this.busRide.idLastStopBus)) {
      return true;
    }
    return false;
  }

  convertTimestampToTime(timestamp: number): string {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }
}
