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

  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private busRideService: BusRideService,
              private reservationService: ReservationService,
              private stopBusService: StopBusService,
              private lineService: LineService) {
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
            this.childSelectedChange();
          }
          console.log(this.children);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.dataSelected = this.today();
    this.dataSelectedChange();
    /*this.stopBusService.getStopBusByType(StopBusType.outward).subscribe(
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
    this.stopBusService.getStopBusByType(StopBusType.return).subscribe(
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
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.linesToSelect = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  today() {
    return (new Date()).toISOString().split('T')[0];
  }

  // Depend from dateSelected and idStopBusesSelected
  private getBusRides() {
    if (this.dataSelected && (this.idOutStopBusSelected || this.idRetStopBusSelected)) {
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
    return null;
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
      let index = this.outStopBuses.findIndex(x => x.id === idStopBus);
      if (index >= 0) {
        return this.outStopBuses[index];
      }
      index = this.retStopBuses.findIndex(x => x.id === idStopBus);
      if (index >= 0) {
        return this.retStopBuses[index];
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
    this.stopBusService.getStopBusByType(StopBusType.outward)
      .subscribe(
        (data) => {
          this.outStopBuses = data.filter( stop =>
            stop.idLine === this.idOutLineSelected);
          this.outStopBuses.sort( (a , b) =>
          a.hours - b.hours);
          this.outStopBusSelectedChange();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getRetStopBuses() {
    this.stopBusService.getStopBusByType(StopBusType.return)
      .subscribe(
        (data) => {
          this.retStopBuses = data.filter( stop =>
            stop.idLine === this.idRetLineSelected);
          this.retStopBuses.sort( (a, b) =>
          a.hours - b.hours);
          this.retStopBusSelectedChange();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  getOutStopBusSelected(): StopBus {
    if (this.idOutStopBusSelected) {
      const index = this.outStopBuses.findIndex(x => x.id === this.idOutStopBusSelected);
      if (index >= 0) {
        return this.outStopBuses[index];
      }
    }
    return null;
  }

  getRetStopBusSelected(): StopBus {
    if (this.idRetStopBusSelected) {
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
    const last = this.outStopBuses.length;
    this.lastStopBusOut = this.outStopBuses[last - 1].name;
    this.getBusRides();
  }

  retStopBusSelectedChange() {
    this.lastStopBusRet = this.retStopBuses[0].name;
    this.getBusRides();
  }

}
