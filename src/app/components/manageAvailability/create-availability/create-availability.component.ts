import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {BusRide} from '../../../models/busride';
import {BusRideService} from '../../../services/bus-ride.service';
import {AlertService} from '../../../services/alert.service';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {StopBusService} from '../../../services/stop-bus.service';
import {Availability, AvailabilityPOST, AvailabilityState} from '../../../models/availability';
import {AvailabilityService} from '../../../services/availability.service';
import {Login} from '../../../models/login';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-create-availability',
  templateUrl: './create-availability.component.html',
  styleUrls: ['./create-availability.component.css']
})
export class CreateAvailabilityComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;
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

  constructor(private authenticationService: AuthenticationService,
              private busRideService: BusRideService,
              private alertService: AlertService,
              private stopBusService: StopBusService,
              private availabilityService: AvailabilityService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']).catch((reason) => this.alertService.error(reason));
    }
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
    const dummy: Login = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = dummy.username;
    this.retStopBuses = new Array<StopBus>();
    this.outStopBuses = new Array<StopBus>();
    this.availabilities = new Array<Availability>();
    this.avbstates = new Array<AvailabilityState>();
    this.avbstates.push(AvailabilityState.available);
    this.avbstates.push(AvailabilityState.checked);
    this.avbstates.push(AvailabilityState.confirmed);
    this.dataSelected = this.today();
    this.dataSelectedChange();
    this.refreshStopBuses();
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
    if (this.dataSelected && this.outStopBusSelectedId && this.retStopBusSelectedId) {
      const temp = new Date(this.dataSelected);
      const nowT = new Date();
      nowT.setHours(0, 0, 0, 0);
      temp.setHours(0, 0, 0, 0);
      if (temp.getTime() === nowT.getTime()) {
        const now = new Date();
        temp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      this.busRideService.getBusRidesFromStartDate(this.retStopBusSelectedId.toString(), temp)
        .subscribe(
          (data) => {
            this.retBusRides = data;
          },
          (error) => {
            this.alertService.error(error);
          }
        );
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

  giveAvailability(idbr: string, idsb: string) {
    const temp = new AvailabilityPOST();
    temp.idBusRide = idbr;
    temp.idStopBus = idsb;
    temp.state = AvailabilityState.available;
    this.loading = true;
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
  }

  getTimeStopBus(busRide: BusRide, stopBus: StopBus): Date {
    if (busRide && stopBus) {
      const temp = new Date();
      temp.setFullYear(busRide.year, busRide.month, busRide.day);
      temp.setHours(0, stopBus.hours, 0, 0);
      return temp;
    }
    return null;
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
        return this.outStopBuses[index];
      }
      return null;
    }
  }

  isBooked(bus: BusRide): Availability {
    if (this.availabilities) {
      for (const x of this.availabilities) {
        if (x.idUser === this.currentUser && bus.id === x.idBusRide) {
          return x;
        }
      }
      return null;
    }
    return null;
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
              this.retStopBusSelectedId = this.retStopBuses[0].id;
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
}
