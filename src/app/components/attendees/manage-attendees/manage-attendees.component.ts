import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {BusRide} from '../../../models/busride';
import {Reservation} from '../../../models/reservation';
import {AuthenticationService} from '../../../services/authentication.service';
import {BusRideService} from '../../../services/bus-ride.service';
import {ReservationService} from '../../../services/reservation.service';
import {AlertService} from '../../../services/alert.service';

@Component({
  selector: 'app-manage-attendees',
  templateUrl: './manage-attendees.component.html',
  styleUrls: ['./manage-attendees.component.css']
})
export class ManageAttendeesComponent implements OnInit {

  busRide: BusRide;
  idBusRide: string;
  idCurrentStopBus: string;
  reservations: Array<Reservation>;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private reservationService: ReservationService) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private onChangePath(params: ParamMap) {
    this.idBusRide = params.get('idBusRide');
    this.idCurrentStopBus = params.get('idCurrentStopBus');
    this.reservationService.getReservationsByBusRideAndStopBus(this.idBusRide, this.idCurrentStopBus)
      .subscribe(
        (data) => {
          this.reservations = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clickPresent() {

  }

  clickAbsent() {

  }

  clickNextStop() {

  }



}
