import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {BusRide, BusRidePUT} from '../../../models/busride';
import {EnumChildGet, Reservation, ReservationPUT} from '../../../models/reservation';
import {AuthenticationService} from '../../../services/authentication.service';
import {ReservationService} from '../../../services/reservation.service';
import {AlertService} from '../../../services/alert.service';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {StopBusService} from '../../../services/stop-bus.service';
import {BusRideService} from '../../../services/bus-ride.service';

@Component({
  selector: 'app-manage-attendees',
  templateUrl: './manage-attendees.component.html',
  styleUrls: ['./manage-attendees.component.css']
})
export class ManageAttendeesComponent implements OnInit {

  busRide: BusRide;
  idBusRide: string;
  idCurrentStopBus: string;
  idNextStopBus: string;
  reservations: Array<Reservation>;
  currentStopBus: StopBus;

  idReservationsPUT: Array<string>;
  reservationsPUT: Array<ReservationPUT>;

  isOutwardStop: boolean;
  isReturnStop: boolean;
  isFirstStop: boolean;
  isLastStop: boolean;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private reservationService: ReservationService,
              private busRideService: BusRideService,
              private stopBusService: StopBusService) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
    this.reservationsPUT = new Array<ReservationPUT>();
    this.idReservationsPUT = new Array<string>();
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private loadReservations() {
    if ((this.isFirstStop && this.isReturnStop) || (this.isLastStop && this.isOutwardStop)) { // quando siamo a scuola
      this.reservationService.getReservationsByBusRide(this.idBusRide)
        .subscribe(
          (data) => {
            if (this.isReturnStop) {
              this.reservations = data;
            } else {
              this.reservations = data.filter(x => x.getIn !== null);
            }
            this.reservations.forEach((res) => {
              if (this.isReturnStop) {
                if (res.getIn !== null) {
                  res.isGetIn = true;
                }
                if (res.absent !== null) {
                  res.isAbsent = true;
                }
              } else {
                if (res.getOut !== null) {
                  res.isGetOut = true;
                }
              }
            });
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    } else {
      this.reservationService.getReservationsByBusRideAndStopBus(this.idBusRide, this.idCurrentStopBus)
        .subscribe(
          (data) => {
            if (this.isOutwardStop) {
              this.reservations = data;
            } else {
              this.reservations = data.filter(x => x.getIn !== null);
            }
            this.reservations.forEach((res) => {
              if (this.isOutwardStop) {
                if (res.getIn !== null) {
                  res.isGetIn = true;
                }
                if (res.absent !== null) {
                  res.isAbsent = true;
                }
              } else {
                if (res.getOut !== null) {
                  res.isGetOut = true;
                }
              }
            });
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
    this.stopBusService.getStobBusById(this.idCurrentStopBus)
      .subscribe(
        (data) => {
          this.currentStopBus = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  private onChangePath(params: ParamMap) {
    this.idBusRide = params.get('idBusRide');
    this.idCurrentStopBus = params.get('idCurrentStopBus');
    this.busRideService.getBusRideById(this.idBusRide)
      .subscribe(
        (data) => {
          this.busRide = data;
          if (this.busRide.stopBusType === StopBusType.ourward) {
            this.isOutwardStop = true;
            this.isReturnStop = false;
          } else {
            this.isOutwardStop = false;
            this.isReturnStop = true;
          }
          const index = this.busRide.stopBuses.map(x => x.id).indexOf(this.idCurrentStopBus);
          if (index === 0) {
            this.isFirstStop = true;
            this.isLastStop = false;
          } else {
            this.isFirstStop = false;
            if (index === (this.busRide.stopBuses.length - 1)) {
              this.isLastStop = true;
            } else {
              this.isLastStop = false;
            }
          }
          if (!this.isLastStop) {
            this.idNextStopBus = this.busRide.stopBuses[index + 1].id;
          }
          this.loadReservations();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clickGetIn(res: Reservation) {
    const resPUT = new ReservationPUT();
    resPUT.idStopBus = this.idCurrentStopBus;
    resPUT.epochTime = 0;
    resPUT.enumChildGet = EnumChildGet.getIn;
    this.reservationService.updateReservationById(res.id, resPUT)
      .subscribe(
        (data) => {
          res.isGetIn = true;
          res.isGetOut = false;
          res.isAbsent = false;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clickGetOut(res: Reservation) {
    const resPUT = new ReservationPUT();
    resPUT.idStopBus = this.idCurrentStopBus;
    resPUT.epochTime = 0;
    resPUT.enumChildGet = EnumChildGet.getOut;
    this.reservationService.updateReservationById(res.id, resPUT)
      .subscribe(
        (data) => {
          res.isGetIn = false;
          res.isGetOut = true;
          res.isAbsent = false;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clickAbsent(res: Reservation) {
    const resPUT = new ReservationPUT();
    resPUT.idStopBus = this.idCurrentStopBus;
    resPUT.epochTime = 0;
    resPUT.enumChildGet = EnumChildGet.absent;
    this.reservationService.updateReservationById(res.id, resPUT)
      .subscribe(
        (data) => {
          res.isGetIn = false;
          res.isGetOut = false;
          res.isAbsent = true;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clickNextStop() {
    let allSetted: boolean;
    allSetted = true;
    this.reservations.forEach((res) => {
      if (!(res.isGetIn || res.isGetOut || res.isAbsent)) {
        allSetted = false;
      }
    });
    if (!allSetted) {
      this.alertService.error('Aggiornare lo stato di tutti i bambini prenotati!');
    } else {
      const busRidePUT = new BusRidePUT();
      busRidePUT.idLastStopBus = this.idCurrentStopBus;
      busRidePUT.timestampLastStopBus = 0;
      this.busRideService.setLastStopBusInBusRide(this.idBusRide, busRidePUT)
        .subscribe(
          (data) => {
            if (!this.isLastStop) {
              this.router.navigate(
                [`/attendees/manage/${this.idBusRide}/${this.idNextStopBus}`]);
            } else {
              this.router.navigate(
                [`/busridesEscort`]);
            }
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }
}
