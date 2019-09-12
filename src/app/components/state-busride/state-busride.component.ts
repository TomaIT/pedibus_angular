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
import * as fileSaver from 'file-saver';
import {json2xml} from 'xml-js';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-state-busride',
  templateUrl: './state-busride.component.html',
  styleUrls: ['./state-busride.component.css']
})
export class StateBusrideComponent implements OnInit, OnDestroy {
  @ViewChild('myDate') myDate: ElementRef;

  lines: Array<LineEnum>;
  busRide: BusRide;
  presenceBusRide: PresenceBusRide;
  directions: Array<StopBusType>;

  selectedDirection: StopBusType;
  selectedLine: LineEnum;
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;
  selectedData: any;

  pollingData: any;
  notExist = false;

  showLegend = false;

  arrExtensions: Array<string>;
  extensionSelected: string;

  isAdmin = false;

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

    if (this.authenticationService.isAdmin() || this.authenticationService.isSysAdmin()) {
      this.isAdmin = true;
    }
    this.arrExtensions = ['xlsx', 'xml', 'json', 'csv'];
    this.extensionSelected = this.arrExtensions[0];
    this.presenceBusRide = new PresenceBusRide();
    this.presenceBusRide.presenceStopBusGETTreeSet = new Array<PresenceStopBus>();
    this.presenceBusRide.presenceStopBusGETTreeSet.forEach(p => {
      p.presenceChildGETSet = new Array<PresenceChild>();
    });
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
          if (params.get('idLine') === null || this.lines.map(l => l.idLine).indexOf(params.get('idLine')) === -1) {
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
          console.log(error.toString());
          if (error.toString().includes('404') === true) {
            this.alertService.error(error);
          }

        }
      );
  }

  private loadBusRide() {
    const today = new Date();
    this.busRideService.getBusRidesFromLineAndStopBusTypeAndData(this.selectedLine.idLine,
      this.selectedDirection, this.selectedYear, this.selectedMonth, this.selectedDay)
      .subscribe(
        (data) => {
          this.notExist = false;
          this.busRide = data;
          },
        (error) => {
          if (!error.toString().includes('404')) {
            this.alertService.error(error);
          } else {
            this.notExist = true;
            this.busRide = undefined;
          }
        }
      );
  }


  private loadPresence() {
    this.busRideService.getPresenceAggregateFromLineAndStopBusTypeAndData(this.selectedLine.idLine,
      this.selectedDirection, this.selectedYear, this.selectedMonth, this.selectedDay)
      .subscribe(
        (data) => {
          this.presenceBusRide = data;
          const presences = new Array<PresenceChild>();
          this.presenceBusRide.presenceStopBusGETTreeSet.forEach(x => {
            x.presenceChildGETSet.forEach(y => {
              presences.push(y);
            });
          });
          if (this.presenceBusRide.stopBusType === StopBusType.return) {
            this.presenceBusRide.presenceStopBusGETTreeSet[0].presenceChildGETSet = presences;
          } else {
            const length = this.presenceBusRide.presenceStopBusGETTreeSet.length;
            this.presenceBusRide.presenceStopBusGETTreeSet[length - 1].presenceChildGETSet = presences.filter(p => !p.absent);
          }
        },
        (error) => {
          if (!error.toString().includes('404')) {
          this.alertService.error(error);
        }}
      );
  }

  private refreshBusRideAndPresences() {
    this.loadPresence();
    this.loadBusRide();
  }

  reloadWithNewPath() {
    const strData = ('0' + this.selectedYear).slice(-4) + ('0' + this.selectedMonth).slice(-2) + ('0' + this.selectedDay).slice(-2);
    this.router.navigate(
      [`/stateBusRide/${this.selectedLine.idLine}/${this.selectedDirection}/${strData}`]);
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

  isBusAlreadyPassed(idStopBus: string): boolean {
    const idStopBuses = this.busRide.stopBuses.map(x => x.id);
    if (idStopBuses.indexOf(idStopBus) <= idStopBuses.indexOf(this.busRide.idLastStopBus)) {
      return true;
    }
    return false;
  }

  convertMinutesToTime(hours: number): string {
    const h = Math.floor(hours / 60);
    const m = hours - (h * 60);
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }
  convertTimestampToTime(timestamp: number): string {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }

  private convertToCSV(presenceBusRide: PresenceBusRide) {
    let csvContent = '';
    let titles = '';
    titles += 'idLine,';
    titles += 'lineName,';
    titles += 'idBusRide,';
    titles += 'stopBusType,';
    titles += 'idLastStopBus,';
    titles += 'nameLastStopBus,';
    titles += 'idStopBus,';
    titles += 'nameStopBus,';
    titles += 'hours,';
    titles += 'idChild,';
    titles += 'nameChild,';
    titles += 'idReservation,';
    titles += 'getOut,';
    titles += 'absent,';
    titles += 'getIn,';
    titles += 'booked';
    titles += '\r\n';
    csvContent += titles;
    let busrideInfo = '';
    busrideInfo += presenceBusRide.idLine + ',';
    busrideInfo += presenceBusRide.lineName + ',';
    busrideInfo += presenceBusRide.idBusRide + ',';
    busrideInfo += presenceBusRide.stopBusType + ',';
    busrideInfo += presenceBusRide.idLastStopBus + ',';
    busrideInfo += presenceBusRide.nameLastStopBus;
    presenceBusRide.presenceStopBusGETTreeSet.forEach(stop => {
      let stopbusInfo = '';
      stopbusInfo += stop.idStopBus + ',';
      stopbusInfo += stop.nameStopBus + ',';
      stopbusInfo += stop.hours;
      stop.presenceChildGETSet.forEach(pres => {
        let presInfo = '';
        presInfo += pres.idChild + ',';
        presInfo += pres.nameChild + ',';
        presInfo += pres.idReservation + ',';
        presInfo += pres.getOut + ',';
        presInfo += pres.absent + ',';
        presInfo += pres.getIn + ',';
        presInfo += pres.booked;
        let row = '';
        row += busrideInfo + ',' + stopbusInfo + ',' + presInfo;
        row += '\r\n';
        csvContent += row;
      });
    });
    return csvContent;
  }

  downloadFile(passedPresBr: PresenceBusRide) { // "menù"

    if ( this.extensionSelected === 'xlsx') {
      this.downloadXlsx(this.busRide.id);
    } else {
      let blob;
      const source = JSON.stringify(passedPresBr);

      if (this.extensionSelected === 'xml') {
        const options = {compact: true, ignoreComment: true, spaces: 4};
        const tempBlob = json2xml(source, options);
        blob = new Blob([tempBlob], {type: 'application/' + this.extensionSelected});
      }
      if (this.extensionSelected === 'json') { // json
        blob = new Blob([source], {type: 'application/' + this.extensionSelected});
      }
      if (this.extensionSelected === 'csv') {
        const sourceCSV = this.convertToCSV(passedPresBr);
        blob = new Blob([sourceCSV], {type: 'text/' + this.extensionSelected});
      }
      fileSaver.saveAs(blob, `${this.busRide.id}.${this.extensionSelected}`);
    }
  }

  downloadXlsx(idBusRide: string) {
    this.busRideService.getDownloadableBusRideInfo(idBusRide).subscribe( (data) => {
        const blobtest = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        fileSaver.saveAs(blobtest, `${idBusRide}.xlsx`);
      }, (error) => { this.alertService.error(error); }
    );
  }

}
