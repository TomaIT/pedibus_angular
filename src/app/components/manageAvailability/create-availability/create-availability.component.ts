import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-create-availability',
  templateUrl: './create-availability.component.html',
  styleUrls: ['./create-availability.component.css']
})
export class CreateAvailabilityComponent implements OnInit {

  busRides: Array<BusRide>;
  direction: StopBusType;
  directions: Array<StopBusType>;
  stopBuses: Array<StopBus>;
  availabilities: Array<Availability>;
  avbstates: Array<AvailabilityState>;
  dataSelected: any;
  stopBusSelected: StopBus;
  stopBusSelectedId: string = null;
  loading = false;
  currentUser: string;

  constructor(private authenticationService: AuthenticationService,
              private busRideService: BusRideService,
              private alertService: AlertService,
              private stopBusService: StopBusService,
              private availabilityService: AvailabilityService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    const dummy: Login = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = dummy.username;
    this.stopBuses = new Array<StopBus>();
    this.directions = new Array<StopBusType>();
    this.availabilities = new Array<Availability>();
    this.avbstates = new Array<AvailabilityState>();
    this.avbstates.push(AvailabilityState.available);
    this.avbstates.push(AvailabilityState.checked);
    this.avbstates.push(AvailabilityState.confirmed);
    this.directions.push(StopBusType.outward);
    this.directions.push(StopBusType.return);
    this.direction = StopBusType.outward;
    this.dataSelected = this.today();
    this.dataSelectedChange();
    this.refreshStopBuses();
    this.getBusRides();
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

  stopBusSelectedChange() {
    this.stopBusSelectedId = this.stopBusSelected.id;
    this.getBusRides();
  }

  private getBusRides() {
    if (this.dataSelected && this.stopBusSelected) {
      const temp = new Date(this.dataSelected);
      const nowT = new Date();
      nowT.setHours(0, 0, 0, 0);
      temp.setHours(0, 0, 0, 0);
      if (temp.getTime() === nowT.getTime()) {
        const now = new Date();
        temp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      this.busRideService.getBusRidesFromStartDate(this.stopBusSelected.id, temp)
        .subscribe(
          (data) => {
            this.busRides = data;
            // this.stopBusSelected = data[0].id;
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

  getStopBusSelected(): StopBus {
    if (this.stopBusSelected) {
      const index = this.stopBuses.findIndex(x => x.id === this.stopBusSelected.id);
      if (index >= 0) {
        return this.stopBuses[index];
      }
    }
    return null;
  }

  changeDirection() {
    this.busRides = [];
    this.refreshStopBuses();
    this.getBusRides();

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

  /*
  delete(idAvl: string) {
    this.loading = true;
  }
  */

  refreshStopBuses() {
    this.stopBusService.getStopBusByType(this.direction)
      .subscribe(
        (data) => {
          this.stopBuses = data.sort((a, b) => {
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
  }
  /*
    transformData(date: Date): string {
      const temp  = new Date(date);
      const day = date.getDay() + 1;
      const mm = date.getMonth() + 1;
      const yy = date.getFullYear().toString().substr(-2);
      return this.checkZero(day) + '.' + this.checkZero(mm) + '.' + yy;
    }
    getHourAndMinutes(trasforma: Date) {
    const temp: Date = new Date(trasforma);
    return this.checkZero(temp.getHours()) + ':' + this.checkZero(temp.getMinutes());
  }
  checkZero(temp: number): string {
    if (temp < 10) {
      return '0' + temp;
    } else {
      return temp.toString();
    }
  }
    */

}
