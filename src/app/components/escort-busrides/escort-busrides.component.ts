import {Component, OnInit} from '@angular/core';
import {BusRide} from '../../models/busride';
import {AlertService} from '../../services/alert.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvailabilityService} from '../../services/availability.service';
import {Availability, AvailabilityState} from '../../models/availability';
import {BusRideService} from '../../services/bus-ride.service';
import {StopBus, StopBusType} from '../../models/stopbus';
import {environment} from '../../../environments/environment';

// TODO: paginazione
@Component({
  selector: 'app-escort-busrides',
  templateUrl: './escort-busrides.component.html',
  styleUrls: ['./escort-busrides.component.css']
})
export class EscortBusridesComponent implements OnInit {

  confirmedAvailabilities: Array<Availability>;
  pageSize = 5;
  p = 1;

  constructor(private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private availabilityService: AvailabilityService,
              private busRideService: BusRideService) {
  }

  ngOnInit() {
    this.confirmedAvailabilities = new Array<Availability>();
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

  checkIfCanStart(busride: BusRide): boolean {
    const today = new Date();
    const data = (today.getHours() * 60) + today.getMinutes();
    const minutes = busride.stopBuses[0].hours;
    const br = new Date(busride.startTime);
    if (br.getUTCMonth() === today.getUTCMonth() && br.getUTCDate() === today.getUTCDate()) {
      if ( (minutes - environment.startingInterval) < data && data < (minutes + environment.startingInterval)) {
       return true;
      }
    }
    return false;
  }

  clickOnBusRide(ca: Availability) {
    let busRide = new BusRide();
    let idStartStopBus: string;
    this.busRideService.getBusRideById(ca.idBusRide)
      .subscribe(
        (data) => {
          busRide = data;
          if (busRide.timestampLastStopBus === null) {
            if (busRide.stopBusType === StopBusType.outward) {
              idStartStopBus = ca.idStopBus;
            } else {
              idStartStopBus = busRide.stopBuses[0].id;
            }
            this.router.navigate(
              [`/attendees/manage/${ca.idBusRide}/${idStartStopBus}`]);
          } else {
            let x = 0;
            for (const stop of busRide.stopBuses) {
              if (stop.id === busRide.idLastStopBus) {
                idStartStopBus = busRide.stopBuses[x + 1].id;
              }
              x++;
            }
            this.router.navigate(
              [`/attendees/manage/${ca.idBusRide}/${idStartStopBus}`]);
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  convertMinutesToTime(hours: number): string {
    const h = Math.floor(hours / 60);
    const m = hours - (h * 60);
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }

  getEscortStartStopBus(availability: Availability) {
    if (availability.busRide.stopBusType === StopBusType.outward) {
      return availability.busRide.stopBuses.filter(sb => sb.id === availability.idStopBus).pop();
    } else {
      return availability.busRide.stopBuses[0];
    }
  }
  getEscortEndStopBus(availability: Availability) {
    if (availability.busRide.stopBusType === StopBusType.outward) {
      return availability.busRide.stopBuses[availability.busRide.stopBuses.length - 1];
    } else {
      return availability.busRide.stopBuses.filter(sb => sb.id === availability.idStopBus).pop();
    }
  }

  onChangePage(event: number) {
    this.p = event;
  }
}
