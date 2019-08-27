import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Router} from '@angular/router';
import {StopBusType} from '../../../models/stopbus';
import {AvailabilityState} from '../../../models/availability';
import {LineEnum} from '../../../models/line';
import {AvailabilityService} from '../../../services/availability.service';
import {LineService} from '../../../services/line.service';
import {StopBusService} from '../../../services/stop-bus.service';
import {BusRideService} from '../../../services/bus-ride.service';
import {Login} from '../../../models/login';
// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-shift-manager',
  templateUrl: './shift-manager.component.html',
  styleUrls: ['./shift-manager.component.css']
})
export class ShiftManagerComponent implements OnInit {
  @ViewChild('myDate') myDate: ElementRef;
  direction: Array<StopBusType> = [StopBusType.outward, StopBusType.return];
  avbstates: Array<AvailabilityState> = [AvailabilityState.available, AvailabilityState.checked,
    AvailabilityState.confirmed, AvailabilityState.readChecked];
  avbList: any;
  lines: Array<LineEnum>;
  dataSelected = this.today();
  lineSelected: LineEnum;
  directionSelected: StopBusType;
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private stopBusService: StopBusService,
              private lineService: LineService,
              private availabilityService: AvailabilityService,
              private busrideService: BusRideService) {
    if (!(this.authenticationService.isAdmin() || this.authenticationService.isSysAdmin())) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.lineSelected = new LineEnum();
    $('#date').datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: new Date(),
      onSelect: (selectedDate, inst) => {
        this.dataSelected = selectedDate;
        this.dataSelectedChange();
      }
    });
    this.directionSelected = StopBusType.outward;
    this.lines = new Array<LineEnum>();
    const user: Login = JSON.parse(localStorage.getItem('currentUser'));
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          for ( let x of data) {
            user.user.idLines.includes(x.idLine);
            this.lines.push(x);
          }
        }
      );
  }

  private dataSelectedChange() {
    const a = new Date(this.dataSelected);
    const b = new Date();
    b.setHours(0, 0, 0, 0);
    a.setHours(0, 0, 0, 0);
    if (a.getTime() >= b.getTime()) {
      if (this.lineSelected !== undefined && this.directionSelected !== undefined) {
        this.getAvailabilities();
      }

    }
  }

  today() {
    return (new Date()).toISOString().split('T')[0];
  }

  getAvailabilities() {
    const data = new Date(this.dataSelected);
    this.busrideService.
    getBusRideByLineAndDirectionAndDate(this.lineSelected.idLine, this.directionSelected, data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
      .subscribe(
        (busride) => {
          console.log(busride);
          this.availabilityService.getBusRideAvailabilities(busride.id)
            .subscribe(
              (availabilities) => {
                console.log(availabilities);
                this.avbList = availabilities.reduce((objectsByKeyValue, obj) => {
                 const value = obj.stopBusName;
                 objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                 return objectsByKeyValue;
               },
                 {});
               console.log(this.avbList);
              }
            );
        }
      );
  }

  chageDirection(event) {
    this.directionSelected = event.target.value;
    if (this.lineSelected !== undefined) {
      this.getAvailabilities();
    }
  }

  changeLine(event) {
    this.lineSelected.idLine = event.target.value;
    for (let x of this.lines) {
      if (x.idLine.localeCompare(this.lineSelected.idLine) === 0) {
        this.lineSelected.lineName = x.lineName;
      }
    }
    if (this.directionSelected !== undefined) {
      this.getAvailabilities();
    }
  }
}
