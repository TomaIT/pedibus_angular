import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {Availability, AvailabilityPUT, AvailabilityState} from '../../../models/availability';
import {AvailabilityService} from '../../../services/availability.service';
import {AlertService} from '../../../services/alert.service';
import {interval} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {BusRideService} from '../../../services/bus-ride.service';
import {StopBus, StopBusType} from '../../../models/stopbus';
import {BusRide} from '../../../models/busride';

@Component({
  selector: 'app-view-availability',
  templateUrl: './view-availability.component.html',
  styleUrls: ['./view-availability.component.css']
})
export class ViewAvailabilityComponent implements OnInit, OnDestroy {

  constructor(private authenticationService: AuthenticationService,
              private availabilityService: AvailabilityService,
              private alertService: AlertService,
              private busRidesService: BusRideService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']).catch((reason) => this.alertService.error(reason));
    }
    this.pollCounter();
    this.pollingData = interval(environment.intervalAvailCheck)
      .subscribe((data) => this.pollCounter());
  }

  availabilities: Array<Availability>;
  avbstates: Array<AvailabilityState>;
  pollingData: any;
  busRides: Array<BusRide>;

  ngOnDestroy(): void {
      this.pollingData.unsubscribe();
  }

  private pollCounter() {
    if (this.authenticationService.isAuthenticated()) {
      this.availabilityService.getAvailabilitiesByUser(this.authenticationService.currentUserValue.username).subscribe(
        (data) => {
          this.availabilities = data;
          this.busRides.length = 0;
          for (const avl of this.availabilities) {
            this.busRides.push(avl.busRide);
          }
        },
        (error3) => { this.alertService.error(error3);
        }
      );
    }
  }

  ngOnInit() {
    this.availabilities = new Array<Availability>();
    this.avbstates = new Array<AvailabilityState>();
    this.busRides = new Array<BusRide>();
    this.avbstates.push(AvailabilityState.available);
    this.avbstates.push(AvailabilityState.checked);
    this.avbstates.push(AvailabilityState.confirmed);
    this.avbstates.push(AvailabilityState.readChecked);

    this.availabilityService.getAvailabilitiesByUser(this.authenticationService.currentUserValue.username).subscribe(
      (data) => {
        this.availabilities = data;
        for (const temp of this.availabilities) {
          this.busRides.push(temp.busRide);
        }
      },
      (error3) => { this.alertService.error(error3);
      }
    );
  }

  visualizeData(time: Date): Date {
    const temp = new Date(time);
    temp.setFullYear(temp.getFullYear(), temp.getMonth(), temp.getDate());
    temp.setHours(temp.getHours(), temp.getMinutes(), 0, 0);
    return temp;
  }

  confirm(avl: Availability) {
    const temp = new AvailabilityPUT();
    temp.state = AvailabilityState.readChecked;
    temp.idStopBus = avl.idStopBus;
    this.availabilityService.updateAvailability(temp, avl.id).subscribe((data) => {
      this.alertService.success('Disponibilità aggiornata con successo.');
      const index = this.availabilities.findIndex(x => x.id === avl.id);
      this.availabilities[index].state = AvailabilityState.readChecked;
    }, (error) => {
      this.alertService.error(error);
    });
  }

  checkConfirm(state: AvailabilityState): boolean {
    return state === AvailabilityState.checked;
  }

  checkDel(state: AvailabilityState): boolean {
    return state === AvailabilityState.confirmed;
  }

  checkAvail(state: AvailabilityState): boolean {
    return state === AvailabilityState.available;
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

  checkrc(state: AvailabilityState): boolean {
    return state === AvailabilityState.readChecked;
  }

  showDep(idbr: string, busname: string) {
    for (const temp of this.busRides) {
      if (temp.id === idbr) {
        if (temp.stopBusType === StopBusType.return) {
          return temp.stopBuses[0].name;
        } else {
          return busname;
        }
      }
    }
  }

  showArr(idbr: string, busname: string) {
    for (const temp of this.busRides) {
      if (temp.id === idbr) {
      if (temp.stopBusType === StopBusType.outward) {
        return temp.stopBuses[temp.stopBuses.length - 1].name;
      } else {
        return busname;
      }
    }
  }
  }
}
