import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ChildService} from '../../services/child.service';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {Child} from '../../models/child';
import {BusRideService} from '../../services/bus-ride.service';
import {BusRide} from '../../models/busride';
import {Reservation, ReservationPOST} from '../../models/reservation';
import {ReservationService} from '../../services/reservation.service';
import {StopBus, StopBusType} from '../../models/stopbus';
import {StopBusService} from '../../services/stop-bus.service';
import {LineService} from '../../services/line.service';
import {LineEnum} from '../../models/line';
import {interval} from 'rxjs';
import {environment} from '../../../environments/environment';

// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;
  children: Array<Child>;
  childSelected: Child;
  dataSelected: any;
  linesToSelect: Array<LineEnum>;
  defaultLineOut: string;
  defaultLineRet: string;
  outBusRides: Array<BusRide>;
  retBusRides: Array<BusRide>;
  reservations: Array<Reservation>;
  outStopBuses: Array<StopBus>;
  retStopBuses: Array<StopBus>;
  loading = false;
  idOutStopBusSelected: string;
  idRetStopBusSelected: string;
  lastStopBusOut: string;
  lastStopBusRet: string;
  idOutLineSelected: string;
  idRetLineSelected: string;
  totalStopBusOut: Array<StopBus>;
  totalStopBusRet: Array<StopBus>;
  pollingData: any;


  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private busRideService: BusRideService,
              private reservationService: ReservationService,
              private stopBusService: StopBusService,
              private lineService: LineService) {
  }


  private pollAvailabilities() {
    if (this.totalStopBusRet && this.totalStopBusOut) {
      this.getBusRides();
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
    this.childService.findByIdUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.children = data.filter(x => !x.isDeleted);
          if (this.children.length > 0) {
            this.childSelected = this.children[0];
            this.stopBusService.getStopBusByType(StopBusType.outward).subscribe(
              (outStop) => {
                this.totalStopBusOut = outStop;
                this.childSelectedChange();
              },
              (error) => {
                this.alertService.error(error);
              }
            );
            this.stopBusService.getStopBusByType(StopBusType.return).subscribe(
              (retStop) => {
                this.totalStopBusRet = retStop;
                this.childSelectedChange();
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
    this.dataSelected = this.today();
    this.dataSelectedChange();
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.linesToSelect = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.pollingData = interval(environment.intervalTimePolling + 5000)
      .subscribe((data) => this.pollAvailabilities());
  }

  today() {
    return (new Date()).toISOString().split('T')[0];
  }

  // Depend from dateSelected and idStopBusesSelected
  private getBusRides() {
    if (this.dataSelected) {
      const temp = new Date(this.dataSelected);
      const nowT = new Date();
      nowT.setHours(0, 0, 0, 0);
      temp.setHours(0, 0, 0, 0);
      if (temp.getTime() === nowT.getTime()) {
        const now = new Date();
        temp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      if (this.idOutStopBusSelected) {
        this.busRideService.getBusRidesFromStartDate(this.idOutStopBusSelected, temp)
          .subscribe(
            (data) => {
              this.outBusRides = data;
            },
            (error) => {
              this.alertService.error(error);
            }
          );
      }
      if (this.idRetStopBusSelected) {
        this.busRideService.getBusRidesFromStartDate(this.idRetStopBusSelected, temp)
          .subscribe(
            (data) => {
              this.retBusRides = data;
              // alert(this.retBusRides[0].startTime);
            },
            (error) => {
              this.alertService.error(error);
            }
          );
      }
    }
  }

  childSelectedChange() {
    this.idOutStopBusSelected = this.childSelected.idStopBusOutDef;
    this.stopBusService.getStobBusById(this.idOutStopBusSelected)
      .subscribe(
        (data) => {
          this.defaultLineOut = data.idLine;
          this.idOutLineSelected = this.defaultLineOut;
          this.getOutStopBuses();
          this.outStopBusSelectedChange();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.idRetStopBusSelected = this.childSelected.idStopBusRetDef;
    // this.retStopBusSelectedChange();
    this.stopBusService.getStobBusById(this.idRetStopBusSelected)
      .subscribe(
        (data) => {
          this.defaultLineRet = data.idLine;
          this.idRetLineSelected = this.defaultLineRet;
          this.getRetStopBuses();
          this.retStopBusSelectedChange();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.reservationService.getReservationsByIdChild(this.childSelected.id)
      .subscribe(
        (data) => {
          this.reservations = data;
          },
        (error) => {
          this.alertService.error(error);
        }
      );
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

  getTimeStopBus(busRide: BusRide, stopBus: StopBus): Date {
    if (busRide && stopBus) {
      const temp = new Date();
      temp.setFullYear(busRide.year, busRide.month, busRide.day);
      temp.setHours(0, stopBus.hours, 0, 0);
      return temp;
    }
    return null;
  }

  // Nota se cambia la costruzione di idReservation bisogna cambiare il metodo
  isBooked(busRide: BusRide): Reservation {

    if (busRide) {
      const idR = this.childSelected.id + '.' + busRide.stopBusType +
        '.' + busRide.year + '.' + busRide.month + '.' + busRide.day;
      // const index = busRide.idReservations.findIndex(x => x.includes(this.childSelected.id));
      // const idR = busRide.idReservations[index];
      if (this.reservations) {
        const index = this.reservations.findIndex(x => x.id === idR);
        if (index >= 0) {
          return this.reservations[index];
        }
      }
      /*for (const temp of this.reservations) {
        const index = busRide.idReservations.findIndex(x => x === temp.id);
        if (index >= 0) {
          return busRide.idReservations[index];
        }
      }*/
    }
  }

  booking(idBusRide: string, idChild: string, idStopBus: string) {
    const temp = new ReservationPOST();
    temp.idStopBus = idStopBus;
    temp.idBusRide = idBusRide;
    temp.idChild = idChild;
    this.loading = true;
    this.reservationService.postReservation(temp)
      .subscribe(
        (data) => {
          this.loading = false;
          this.alertService.success('Prenotato con successo.');
          this.reservations.push(data);
          this.getBusRides();
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }

  getReservation(idReservation: string): Reservation {
    if (idReservation) {
      const index = this.reservations.findIndex(x => x.id === idReservation);
      if (index >= 0) {
        return this.reservations[index];
      }
    }
    return null;
  }

  getStopBus(idStopBus: string): StopBus {
    if (idStopBus) {
      let index = this.totalStopBusOut.findIndex(x => x.id === idStopBus);
      if (index >= 0) {
        return this.totalStopBusOut[index];
      }
      index = this.totalStopBusRet.findIndex(x => x.id === idStopBus);
      if (index >= 0) {
        return this.totalStopBusRet[index];
      }
    }
    return null;
  }

  delete(idReservation: string) {
    this.loading = true;
    this.reservationService.deleteReservation(idReservation)
      .subscribe(
        (data) => {
          const index = this.reservations.findIndex(x => x.id === idReservation);
          if (index >= 0) {
            this.reservations.splice(index, 1);
          }
          this.alertService.success('Prenotazione cancellata con successo.');
          this.loading = false;
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }

  getOutStopBuses() {
    if (this.totalStopBusOut) {
      this.outStopBuses = this.totalStopBusOut.filter(x => x.idLine === this.idOutLineSelected);
      this.outStopBuses.sort((a, b) => a.hours - b.hours);
      this.outStopBuses.splice(this.outStopBuses.length - 1, 1);
    }
  }

  getRetStopBuses() {
    if (this.totalStopBusRet) {
      this.retStopBuses = this.totalStopBusRet.filter(x => x.idLine === this.idRetLineSelected);
      this.retStopBuses.sort((a, b) => a.hours - b.hours);
      this.retStopBuses.splice(0, 1);
    }
  }

  getOutStopBusSelected(): StopBus {
    if (this.idOutStopBusSelected && this.outStopBuses) {
      const index = this.outStopBuses.findIndex(x => x.id === this.idOutStopBusSelected);
      if (index >= 0) {
        return this.outStopBuses[index];
      }
    }
    return null;
  }

  getRetStopBusSelected(): StopBus {
    if (this.idRetStopBusSelected && this.retStopBuses) {
      const index = this.retStopBuses.findIndex(x => x.id === this.idRetStopBusSelected);
      if (index >= 0) {
        return this.retStopBuses[index];
      }
    }
    return null;
  }

  outLineSelectedChange() {
    this.outBusRides = undefined;
    this.idOutStopBusSelected = undefined;
    this.getOutStopBuses();
  }

  retLineSelectedChange() {
    this.retBusRides = undefined;
    this.idRetStopBusSelected = undefined;
    this.getRetStopBuses();
  }

  outStopBusSelectedChange() {
    this.getBusRides();
    const last = this.outStopBuses.length;
    this.lastStopBusOut = this.outStopBuses[last - 1].name;
  }

  retStopBusSelectedChange() {
    this.getBusRides();
    this.lastStopBusRet = this.retStopBuses[0].name;
  }

}
