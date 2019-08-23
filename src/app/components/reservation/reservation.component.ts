import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ChildService} from '../../services/child.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Child} from '../../models/child';
import {BusRideService} from '../../services/bus-ride.service';
import {BusRide} from '../../models/busride';
import {Reservation, ReservationPOST} from '../../models/reservation';
import {ReservationService} from '../../services/reservation.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  children: Array<Child>;
  childSelected: Child;
  dataSelected: any;
  outBusRides: Array<BusRide>;
  retBusRides: Array<BusRide>;
  reservations: Array<Reservation>;
  loading = false;


  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private busRideService: BusRideService,
              private reservationService: ReservationService) {
    if (!this.authenticationService.isParent()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.childService.findByIdUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.children = data.filter(x => !x.isDeleted);
          if (this.children.length > 0) {
            this.childSelected = this.children[0];
            this.childSelectedChange();
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.dataSelected = this.today();
    this.dataSelectedChange();
  }

  today() {
    return (new Date()).toISOString().split('T')[0];
  }

  private getBusRides() {
    if (this.dataSelected && this.childSelected) {
      const temp = new Date(this.dataSelected);
      const now = new Date();
      temp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      this.busRideService.getBusRidesFromStartDate(this.childSelected.idStopBusOutDef, temp)
        .subscribe(
          (data) => {
            this.outBusRides = data;
          },
          (error) => {
            this.alertService.error(error);
          }
        );
      this.busRideService.getBusRidesFromStartDate(this.childSelected.idStopBusRetDef, temp)
        .subscribe(
          (data) => {
            this.retBusRides = data;
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }

  childSelectedChange() {
    this.getBusRides();
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

  getTimeDefaultStopBusOut(): Date {
    if (this.childSelected && this.outBusRides.length > 0) {
      const temp = new Date(this.outBusRides[0].startTime);
      temp.setHours(0);
      temp.setMinutes(this.childSelected.stopBusOutDef.hours);
      return temp;
    }
    return null;
  }

  getTimeDefaultStopBusRet(): Date {
    if (this.childSelected && this.retBusRides.length > 0) {
      const temp = new Date(this.retBusRides[0].startTime);
      temp.setHours(0);
      temp.setMinutes(this.childSelected.stopBusRetDef.hours);
      return temp;
    }
    return null;
  }

  isBooked(busRide: BusRide): string {
    for (const temp of this.reservations) {
      const index = busRide.idReservations.findIndex(x => x === temp.id);
      if (index >= 0) {
        return busRide.idReservations[index];
      }
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
}
