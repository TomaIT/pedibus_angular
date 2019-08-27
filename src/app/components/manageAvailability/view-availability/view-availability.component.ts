import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {Availability, AvailabilityPUT, AvailabilityState} from '../../../models/availability';
import {AvailabilityService} from '../../../services/availability.service';
import {AlertService} from '../../../services/alert.service';
import {Login} from '../../../models/login';

@Component({
  selector: 'app-view-availability',
  templateUrl: './view-availability.component.html',
  styleUrls: ['./view-availability.component.css']
})
export class ViewAvailabilityComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private availabilityService: AvailabilityService,
              private alertService: AlertService,
              private router: Router) {
    if (!this.authenticationService.isEscort()) {
      this.router.navigate(['/home']).catch((reason) => this.alertService.error(reason));
    }
  }

  availabilities: Array<Availability>;
  currentUser: string;
  avbstates: Array<AvailabilityState>;

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
      (data) => {
        this.availabilities = data;
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
}
