import {Component, OnDestroy, OnInit, Pipe, PipeTransform} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {BusRide, BusRidePUT} from '../../../models/busride';
import {EnumChildGet, Reservation, ReservationPUT} from '../../../models/reservation';
import {AuthenticationService} from '../../../services/authentication.service';
import {ReservationService} from '../../../services/reservation.service';
import {AlertService} from '../../../services/alert.service';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {StopBusService} from '../../../services/stop-bus.service';
import {BusRideService} from '../../../services/bus-ride.service';
import {FormControl} from '@angular/forms';
import {ChildService} from '../../../services/child.service';
import {Child} from '../../../models/child';
import {AvailabilityService} from '../../../services/availability.service';
import {interval} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-manage-attendees',
  templateUrl: './manage-attendees.component.html',
  styleUrls: ['./manage-attendees.component.css']
})
export class ManageAttendeesComponent implements OnInit, OnDestroy {

  busRide: BusRide;
  idBusRide: string;
  idCurrentStopBus: string;
  idNextStopBus: string;
  reservations: Array<Reservation>;
  currentStopBus: StopBus;
  idLastStopForThisEscort: string;

  idReservationsPUT: Array<string>;
  reservationsPUT: Array<ReservationPUT>;

  isOutwardStop: boolean;
  isReturnStop: boolean;
  isFirstStop: boolean;
  isLastStop: boolean;

  stringSearch: string;
  showBoxSearchChildren: boolean;

  nameChild = new FormControl('');
  childrenWithoutReservation: Array<Child>;

  isAllLoaded = false;  // evita di fare il polling se non ho ancora le info necessarie
  pollingData: any;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private reservationService: ReservationService,
              private busRideService: BusRideService,
              private stopBusService: StopBusService,
              private childService: ChildService,
              private availabilityService: AvailabilityService) {
    this.reservationsPUT = new Array<ReservationPUT>();
    this.idReservationsPUT = new Array<string>();
  }

  ngOnInit() {
    this.reservations = new Array<Reservation>();
    this.currentStopBus = new StopBus();
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
    this.pollingData = interval(environment.intervalTimePolling)
      .subscribe((data) => this.refreshReservationAndChildren());
  }
  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  private refreshReservationAndChildren() {
    if (this.isAllLoaded) {
      this.loadReservations();
      if (this.isOutwardStop) {
        this.loadChildrenWithoutReservation();
      }
    }
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

  private loadChildrenWithoutReservation() {
    this.childService.getChildrenWithoutReservationByBusRideAndStopBus(this.idBusRide, this.idCurrentStopBus)
      .subscribe(
        (data2) => {
          this.childrenWithoutReservation = data2;
        },
        (error2) => {
          this.alertService.error(error2);
        }
      );
  }

  private onChangePath(params: ParamMap) {
    const today = new Date();
    this.idBusRide = params.get('idBusRide');
    this.idCurrentStopBus = params.get('idCurrentStopBus');
    this.showBoxSearchChildren = false;
    this.busRideService.getBusRideById(this.idBusRide)
      .subscribe(
        (data) => {
          this.busRide = data;
          if (this.busRide.stopBusType === StopBusType.outward) {
            this.isOutwardStop = true;
            this.isReturnStop = false;
            this.idLastStopForThisEscort = null;
            this.loadChildrenWithoutReservation();
          } else {
            this.isOutwardStop = false;
            this.isReturnStop = true;
            this.childrenWithoutReservation = null;
            this.availabilityService.getAvailabilitiesByUser(this.authenticationService.currentUserValue.username)
              .subscribe(
                (data3) => {
                  data3.filter(av => av.idBusRide === this.idBusRide);
                  this.idLastStopForThisEscort = data3.pop().idStopBus;
                },
                (error3) => {
                  this.alertService.error(error3);
                }
              );
          }
          const index = this.busRide.stopBuses.map(x => x.id).indexOf(this.idCurrentStopBus);
          if (index === 0) {
            this.isFirstStop = true;
            this.isLastStop = false;
          } else {
            const busRideDate = new Date(this.busRide.year, this.busRide.month, this.busRide.day, this.busRide.stopBuses[index].hours);
            if (busRideDate.getTime() < (today.getTime() - 1800) || busRideDate.getTime() > (today.getTime() + 1800)) {
              this.router.navigate(['/busridesEscort']);
            } else {
              this.isFirstStop = false;
              if (index === (this.busRide.stopBuses.length - 1)) {
                this.isLastStop = true;
              } else {
                this.isLastStop = false;
              }
            }
          }
          if (!this.isLastStop) {
            this.idNextStopBus = this.busRide.stopBuses[index + 1].id;
          }
          this.isAllLoaded = true;
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

  clickGetInWithoutReservation(child: Child, index: number) {
    const resPUT = new ReservationPUT();
    resPUT.idStopBus = this.idCurrentStopBus;
    resPUT.epochTime = 0;
    resPUT.enumChildGet = EnumChildGet.getIn;
    this.reservationService.postReservationChildWithoutReservation(child.id, this.idBusRide, this.idCurrentStopBus, resPUT)
      .subscribe(
        (data) => {
          delete this.childrenWithoutReservation[index];
          data.isGetIn = true;
          data.isGetOut = false;
          data.isAbsent = false;
          this.reservations.push(data);
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
            if (this.isLastStop || (this.isOutwardStop && this.idCurrentStopBus === this.idLastStopForThisEscort)) {
              this.router.navigate(
                [`/busridesEscort`]);
            } else {
              this.router.navigate(
                [`/attendees/manage/${this.idBusRide}/${this.idNextStopBus}`]);
            }
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }
}


@Pipe({
  name: 'myfilterChildrenByNameAndSurname',
  pure: false
})
export class MyFilterChildrenPipe implements PipeTransform {
  transform(items: Child[], filter: string): Array<Child> {
    if (!items || !filter || filter === '') {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(x => (
      x.firstname.toLowerCase().indexOf(filter.toLowerCase()) !== -1) || (x.surname.toLowerCase().indexOf(filter.toLowerCase()) !== -1));
  }
}

