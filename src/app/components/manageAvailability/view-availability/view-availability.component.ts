import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {Availability, AvailabilityPUT, AvailabilityState} from '../../../models/availability';
import {AvailabilityService} from '../../../services/availability.service';
import {AlertService} from '../../../services/alert.service';
import {Login} from '../../../models/login';
import {BusRideService} from '../../../services/bus-ride.service';
import {BusRide} from '../../../models/busride';
import {StopBusService} from '../../../services/stop-bus.service';

@Component({
  selector: 'app-view-availability',
  templateUrl: './view-availability.component.html',
  styleUrls: ['./view-availability.component.css']
})
export class ViewAvailabilityComponent implements OnInit {

  availabilities: Array<Availability>;
  currentUser: string;
  avbstates: Array<AvailabilityState>;

  constructor(private authenticationService: AuthenticationService,
              private availabilityService: AvailabilityService,
              private alertService: AlertService,
              private busRideService: BusRideService,
              private stopBusService: StopBusService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    const dummy: Login = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = dummy.username;
    this.availabilities = new Array<Availability>();
    this.avbstates = new Array<AvailabilityState>();
    this.avbstates.push(AvailabilityState.available);
    this.avbstates.push(AvailabilityState.checked);
    this.avbstates.push(AvailabilityState.confirmed);
    this.avbstates.push(AvailabilityState.readChecked);
    this.availabilityService.getAvailabilitiesByUser(this.currentUser).subscribe(
      (data) => { this.availabilities = data; },
      (error3) => { this.alertService.error(error3);
      }
    );
  }

  getLineName(brid: string): string {
    let temp = 'invalid';
    this.busRideService.getBusRideById(brid).subscribe(
      (data) => {
        temp = data.lineName;
      },
      (error2) => {
        this.alertService.error(error2);
        temp = 'linenameerror';
      });
    return temp;
  }

  getStopName(spid: string): string {
    let temp = 'invalid';
    this.stopBusService.getStobBusById(spid).subscribe(
      (data) => {
        temp = data.name;
      },
      (error1) => { this.alertService.error(error1);
                    temp = 'stopError';
      });
    return temp;
  }

  getDatePassage(avl: Availability) {
    this.busRideService.getBusRideById(avl.idBusRide).subscribe(
      (data) => {
        const temp: BusRide = data;
        for ( const sb of temp.stopBuses) {
          if (sb.id === avl.idStopBus) {
            return temp.day + '/' + temp.month + '/' + temp.year + ' - ' + 'num ore'; // this.convertHoursToTime(sb.hours);
          }
        }
      },
      (error4) => { this.alertService.error(error4); }
    );
  }

  convertHoursToTime(hours: number): string {
    const h = Math.floor(hours / 60);
    const m = hours - (h * 60);
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }

  confirm(avl: Availability) {
    const temp = new AvailabilityPUT();
    temp.state = AvailabilityState.readChecked;
    temp.idStopBus = avl.idStopBus;
    this.availabilityService.updateAvailability(temp, avl.id).subscribe((data) => {
      this.alertService.success('Disponibilità aggiornata con successo.');
    }, (error) => {
      this.alertService.error(error);
    });
  }

  checkConfirm(state: AvailabilityState): boolean {
    return state === AvailabilityState.available;
  }

  checkDel(state: AvailabilityState): boolean {
    return state !== AvailabilityState.confirmed;
  }


  delete(avl: Availability) {
    this.availabilityService.deleteAvailability(avl.id).subscribe( (data) => {
      const index = this.availabilities.findIndex(x => x.id === avl.id);
      if (index >= 0) {
        this.availabilities.splice(index, 1);
      }
      this.alertService.success('Disponibilità cancellata con successo.');
    },
      (error) => {
        this.alertService.error(error);
      });
  }
}
