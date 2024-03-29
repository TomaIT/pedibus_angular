import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {BusRide} from '../../../models/busride';
import {BusRideService} from '../../../services/bus-ride.service';
import {AlertService} from '../../../services/alert.service';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {StopBusService} from '../../../services/stop-bus.service';
import {Availability, AvailabilityPOST, AvailabilityState} from '../../../models/availability';
import {AvailabilityService} from '../../../services/availability.service';
import {interval} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {LineEnum} from '../../../models/line';
import {LineService} from '../../../services/line.service';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-create-availability',
  templateUrl: './create-availability.component.html',
  styleUrls: ['./create-availability.component.css']
})
export class CreateAvailabilityComponent implements OnInit, OnDestroy {

  @ViewChild('myDate', {static: false}) myDate: ElementRef;
  retBusRides: Array<BusRide>;
  outBusRides: Array<BusRide>;
  retStopBuses: Array<StopBus>;
  outStopBuses: Array<StopBus>;
  availabilities: Array<Availability>;
  avbstates: Array<AvailabilityState>;
  dataSelected: any;
  outStopBusSelectedId: string;
  retStopBusSelectedId: string;
  loading = false;
  currentUser: string;
  pollingData: any;
  linesToSelect: Array<LineEnum>;
  outLineSelectedId: string;
  retLineSelectedId: string;

  constructor(private authenticationService: AuthenticationService,
              private busRideService: BusRideService,
              private alertService: AlertService,
              private stopBusService: StopBusService,
              private availabilityService: AvailabilityService,
              private router: Router,
              private lineService: LineService) {
    this.pollCounter();
    this.pollingData = interval(environment.intervalAvailCheck)
      .subscribe((data) => this.pollCounter());
  }

  private pollCounter() {
    if (this.authenticationService.isAuthenticated()) {
      this.getBusRides();
    }
  }

  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  ngOnInit() {
    $('#date').datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: new Date(),
      onSelect: (selectedDate, inst) => {
        this.dataSelected = selectedDate;
        this.dataSelectedChange();
      }
    });
    // this.retStopBuses = new Array<StopBus>();
    // this.outStopBuses = new Array<StopBus>();
    this.availabilities = new Array<Availability>();
    this.avbstates = new Array<AvailabilityState>();
    this.avbstates.push(AvailabilityState.available);
    this.currentUser = this.authenticationService.currentUserValue.username;
    this.avbstates.push(AvailabilityState.checked);
    this.avbstates.push(AvailabilityState.confirmed);
    this.dataSelected = this.today();
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.linesToSelect = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.dataSelectedChange();
    // this.refreshStopBuses();
    this.availabilityService.getAvailabilitiesByUser(this.currentUser).subscribe(
      (data) => { this.availabilities = data; },
      (error) => { this.alertService.error(error);
      }
    );
  }

  today() {
    return (new Date()).toISOString().split('T')[0];
  }
  dataSelectedChange() {
    const a = new Date(this.dataSelected);
    const b = new Date();
    b.setHours(0, 0, 0, 0);
    a.setHours(0, 0, 0, 0);
    if (a.getTime() >= b.getTime()) {
      this.getBusRides();
    }
  }

  retStopBusSelectedChange() {
    this.getBusRides();
  }

  outStopBusSelectedChange() {
    this.getBusRides();
  }

  private getBusRides() {
    if (this.dataSelected && (this.outStopBusSelectedId || this.retStopBusSelectedId)) {
      const temp = new Date(this.dataSelected);
      const nowT = new Date();
      nowT.setHours(0, 0, 0, 0);
      temp.setHours(0, 0, 0, 0);
      if (temp.getTime() === nowT.getTime()) {
        const now = new Date();
        temp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      if (this.retStopBusSelectedId) {
        this.busRideService.getBusRidesFromStartDate(this.retStopBusSelectedId.toString(), temp)
          .subscribe(
            (data) => {
              this.retBusRides = data;
            },
            (error) => {
              this.alertService.error(error);
            }
          );
      }
      if (this.outStopBusSelectedId) {
        this.busRideService.getBusRidesFromStartDate(this.outStopBusSelectedId.toString(), temp)
          .subscribe(
            (data) => {
              this.outBusRides = data;
            },
            (error) => {
              this.alertService.error(error);
            }
          );
      }
    }
  }

  giveAvailability(idbr: string, idsb: string) {
    const temp = new AvailabilityPOST();
    temp.idBusRide = idbr;
    temp.idStopBus = idsb;
    temp.state = AvailabilityState.available;
    this.loading = true;
    this.busRideService.getBusRideById(idbr).subscribe(
      (data1) => {
        if (data1) {
        this.availabilityService.addAvailability(temp).subscribe((data) => {
            this.loading = false;
            this.alertService.success('Disponibilità inviata con successo.');
            this.availabilities.push(data);
            this.getBusRides();
          },
          (error) => {
            this.alertService.error(error);
            this.loading = false;
          });
      } else {
          this.alertService.error('BusRide not found');
        }
        }, (error2) => {
        this.alertService.error('BusRide not found');
      }
    );
  }

  getTimeStopBus(busRide: BusRide, stopBus: StopBus): Date {
    if (busRide && stopBus) {
      const temp = new Date();
      temp.setFullYear(busRide.year, busRide.month, busRide.day);
      const h = Math.floor(stopBus.hours / 60);
      const m = stopBus.hours - (h * 60);
      temp.setHours(h, m, 0, 0);
      return temp;
    }
    return null;
  }

  getOutStopBuses() {
    this.outStopBuses = new Array<StopBus>();
    this.stopBusService.getStopBusByType(StopBusType.outward)
      .subscribe(
        (data) => {
          this.outStopBuses = data.filter( stop =>
            stop.idLine === this.outLineSelectedId);
          this.outStopBuses.sort( (a , b) =>
            a.hours - b.hours);
          this.outStopBuses.splice(this.outStopBuses.length - 1, 1);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getRetStopBuses() {
    this.retStopBuses = new Array<StopBus>();
    this.stopBusService.getStopBusByType(StopBusType.return)
      .subscribe(
        (data) => {
          this.retStopBuses = data.filter( stop =>
            stop.idLine === this.retLineSelectedId);
          this.retStopBuses.sort( (a, b) =>
            a.hours - b.hours);
          this.retStopBuses.splice(0, 1);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getOutStopBusSelected(): StopBus {
    if (this.outStopBusSelectedId) {
      const index = this.outStopBuses.findIndex(x => x.id === this.outStopBusSelectedId);
      if (index >= 0) {
        return this.outStopBuses[index];
      }
      return null;
    }
  }

  getRetStopBusSelected(): StopBus {
    if (this.retStopBusSelectedId) {
      const index = this.retStopBuses.findIndex(x => x.id === this.retStopBusSelectedId);
      if (index >= 0) {
        return this.retStopBuses[index];
      }
      return null;
    }
  }

  isBooked(bus: string): boolean {
    if (this.availabilities.length > 0) {
      for (const x of this.availabilities) {
        if (bus === x.idBusRide) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  checkBookedDate(busid: string, lineName: string, date: Date): boolean {
    if (this.availabilities.length > 0) {
      for (const x of this.availabilities) {
        if ((busid !== x.idBusRide) && (lineName !== x.lineNameOfBusRide)) {
          // per escludere la prenotazione selezionata e le fermate della stessa linea
          if (x.startDateOfBusRide === date) {
            return true; // inizio esattamente alla stessa ora
          } else {
            const busDate = new Date(date);
            const avDate = new Date(x.startDateOfBusRide);
            if (busDate.getMonth() === avDate.getMonth()) {
              if (busDate.getDate() === avDate.getDate()) {
                const temphAv = avDate.getHours();
                const tempB = busDate.getHours();
                // tslint:disable-next-line:max-line-length
                if (tempB === temphAv) {
                  return true;
                } else {
                    if ( temphAv - tempB > 2) {
                      // do nothing
                    } else {
                      if (temphAv - tempB > -1) {
                        return true; // perchè la differenza è troppo bassa
                      }
                    }
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  refreshStopBuses() {
    if (this.retStopBuses.length === 0) {
      this.stopBusService.getStopBusByType(StopBusType.return)
        .subscribe(
          (data) => {
            this.retStopBuses = data.sort((a, b) => {
              if (a.idLine === b.idLine) {
                return a.hours - b.hours;
              }
              return a.idLine.localeCompare(b.idLine);
            });
            if (this.retStopBusSelectedId === undefined) {
              this.retStopBusSelectedId = this.retStopBuses[this.retStopBuses.length - 1].id; // però non è della stessa linea
            }
            if (this.outStopBuses.length === 0) {
              this.stopBusService.getStopBusByType(StopBusType.outward)
                .subscribe(
                  (data1) => {
                    this.outStopBuses = data1.sort((a, b) => {
                      if (a.idLine === b.idLine) {
                        return a.hours - b.hours;
                      }
                      return a.idLine.localeCompare(b.idLine);
                    });
                    if (this.outStopBusSelectedId === undefined) {
                      this.outStopBusSelectedId = this.outStopBuses[0].id;
                    }
                    this.getBusRides();
                  },
                  (error) => {
                    this.alertService.error(error);
                  }
                );
            }
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }

  getOutNameStopBusSelected(sbid: string): string {
    for (const stb of this.outStopBuses) {
      if (stb.id === sbid) {
        return stb.name;
      }
    }
    return 'stopbus error';
  }

  getRetNameStopBusSelected(sbid: string): string {
    for (const stb of this.retStopBuses) {
      if (stb.id === sbid) {
        return stb.name;
      }
    }
    return 'stopbus error';
  }

  outLineSelectedChange() {
    this.outBusRides = undefined;
    this.outStopBuses = undefined;
    this.outStopBusSelectedId = undefined;
    this.getOutStopBuses();
  }

  retLineSelectedChange() {
    this.retBusRides = undefined;
    this.retStopBuses = undefined;
    this.retStopBusSelectedId = undefined;
    this.getRetStopBuses();
  }
}
