import {Component, OnInit} from '@angular/core';
import {BusRide} from '../../models/busride';
import {AlertService} from '../../services/alert.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvailabilityService} from '../../services/availability.service';
import {Availability} from '../../models/availability';
import {BusRideService} from '../../services/bus-ride.service';
import {StopBusType} from '../../models/stopbus';

@Component({
  selector: 'app-escort-busrides',
  templateUrl: './escort-busrides.component.html',
  styleUrls: ['./escort-busrides.component.css']
})
export class EscortBusridesComponent implements OnInit {

  confirmedBusRides: Array<BusRide>;
  confirmedAvailabilities: Array<Availability>;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private availabilityService: AvailabilityService,
              private busRideService: BusRideService) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.availabilityService.getAvailabilitiesByUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.confirmedAvailabilities = data.filter(x => x.state.toString() === 'Confirmed');
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clickOnBusRide(ca: Availability) {
    let busRide: BusRide;
    let idStartStopBus: string;
    this.busRideService.getBusRideById(ca.idBusRide)
      .subscribe(
        (data) => {
          busRide = data;
          if (busRide.stopBusType === StopBusType.ourward) {
            idStartStopBus = ca.idStopBus;
          } else {
            idStartStopBus = busRide.stopBuses[0].id;
          }
          this.router.navigate(
            [`/attendees/manage/${ca.idBusRide}/${idStartStopBus}`]);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }
}
