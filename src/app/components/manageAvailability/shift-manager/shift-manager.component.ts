import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StopBusType} from '../../../models/stopbus';
import {Availability, AvailabilityPUT, AvailabilityState, GroupedAvailabilities} from '../../../models/availability';
import {LineEnum} from '../../../models/line';
import {AvailabilityService} from '../../../services/availability.service';
import {LineService} from '../../../services/line.service';
import {StopBusService} from '../../../services/stop-bus.service';
import {BusRideService} from '../../../services/bus-ride.service';
import {Login} from '../../../models/login';
import {UserService} from '../../../services/user.service';
import {AlertService} from '../../../services/alert.service';
import {interval} from 'rxjs';
import {environment} from '../../../../environments/environment';
// jQuery Sign $
declare let $: any;

@Component({
  selector: 'app-shift-manager',
  templateUrl: './shift-manager.component.html',
  styleUrls: ['./shift-manager.component.css']
})
export class ShiftManagerComponent implements OnInit, OnDestroy {
  @ViewChild('myDate', { static: true }) myDate: ElementRef;
  direction: Array<StopBusType> = [StopBusType.outward, StopBusType.return];
  avbstates: Array<AvailabilityState> = [AvailabilityState.available, AvailabilityState.checked,
    AvailabilityState.confirmed, AvailabilityState.readChecked];
  avbListOut: Array<GroupedAvailabilities>;
  avbListRet: Array<GroupedAvailabilities>;
  lines: Array<LineEnum>;
  dataSelected = this.today();
  lineSelected: LineEnum;
  directionSelected: StopBusType;
  totalRet = 0;
  totalOut = 0;
  pollingData: any;
  busRideOut: string;
  busRideRet: string;
  loadingOut = false;
  loadingRet = false;

  private pollAvailabilities() {
    if (this.lineSelected !== undefined) {
      this.getAvailabilities();
    }
  }
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private stopBusService: StopBusService,
              private lineService: LineService,
              private availabilityService: AvailabilityService,
              private busrideService: BusRideService,
              private userService: UserService,
              private alertService: AlertService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.lineSelected = undefined;
    $('#date').datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: new Date(),
      onSelect: (selectedDate, inst) => {
        this.dataSelected = selectedDate;
        this.dataSelectedChange();
      }});
    this.lines = new Array<LineEnum>();
    const user: Login = JSON.parse(localStorage.getItem('currentUser'));
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          for (const x of data) {
            for (const uLine of user.user.idLines) {
              if (uLine.localeCompare(x.idLine) === 0) {
                this.lines.push(x);
              }
            }
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.pollingData = interval(environment.intervalTimePolling + 5000)
      .subscribe((data) => this.pollAvailabilities());
    // this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.getAvailabilities(params));
  }

  ngOnDestroy(): void {
    this.pollingData.unsubscribe();
  }

  private dataSelectedChange() {
    const a = new Date(this.dataSelected);
    const b = new Date();
    b.setHours(0, 0, 0, 0);
    a.setHours(0, 0, 0, 0);
    if (a.getTime() >= b.getTime()) {
        if (this.lineSelected !== undefined) {
          this.getAvailabilities();
        }
    }
  }

  today() {
    return (new Date()).toISOString().split('T')[0];
  }

  getAvailabilities() {
    const data = new Date(this.dataSelected);
    if (this.lineSelected !== null) {
      this.loadingOut = true;
      this.busrideService.// tslint:disable-next-line:max-line-length
      getBusRidesFromLineAndStopBusTypeAndData(this.lineSelected.idLine, StopBusType.outward, data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
        .subscribe(
          (busride) => {
            this.busRideOut = busride.id;
            this.availabilityService.getBusRideAvailabilities(busride.id)
              .subscribe(
                (availabilities) => {

                  this.totalOut = availabilities.length;
                  const arr: Array<string> = new Array<string>();
                  const grouped = availabilities.reduce((objectsByKeyValue: Array<Availability>, obj) => {
                      const value = obj.stopBusName;
                      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                      return objectsByKeyValue;
                    },
                    {});
                  this.avbListOut = new Array<GroupedAvailabilities>();
                  Object.keys(grouped).forEach((key) => {
                    const parsed: GroupedAvailabilities = new GroupedAvailabilities();
                    parsed.stopName = key;
                    arr.push(key);
                    parsed.availabilities = grouped[key];
                    parsed.startTime = parsed.availabilities[0].busRide.stopBuses[0].hours;
                    this.avbListOut.push(parsed);
                  });
                  for (const stop of busride.stopBuses) {
                    for (const avb of this.avbListOut) {
                      if (stop.name === avb.stopName) {
                        avb.startTime = stop.hours;
                      }
                    }
                    if (arr.includes(stop.name) === false) {
                      const parsed: GroupedAvailabilities = new GroupedAvailabilities();
                      parsed.stopName = stop.name;
                      parsed.startTime = stop.hours;
                      parsed.availabilities = null;
                      this.avbListOut.push(parsed);
                    }
                  }
                  this.avbListOut.sort((a, b) => {
                    return a.startTime - b.startTime;
                  });
                  if (this.dataSelected === this.today()) {
                    const now = new Date();
                    const seconds = (now.getHours() * 60) + now.getMinutes();
                    console.log(seconds);
                    if (this.avbListOut[0].startTime <= seconds) {
                      this.avbListOut = undefined;
                    }
                  }
                },
                (error) => {
                  this.alertService.error(error);
                }
              );
            this.loadingOut = false;
          },
          (error) => {
            this.loadingOut = false;
            this.avbListOut = undefined;
          }
        );
      this.loadingRet = true;
      this.busrideService.// tslint:disable-next-line:max-line-length
      getBusRidesFromLineAndStopBusTypeAndData(this.lineSelected.idLine, StopBusType.return, data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
        .subscribe(
          (busride) => {
            this.availabilityService.getBusRideAvailabilities(busride.id)
              .subscribe(
                (availabilities) => {

                  this.totalRet = availabilities.length;
                  this.busRideRet = busride.id;
                  const arr: Array<string> = new Array<string>();
                  const grouped = availabilities.reduce((objectsByKeyValue: Array<Availability>, obj) => {
                      const value = obj.stopBusName;
                      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                      return objectsByKeyValue;
                    },
                    {});
                  this.avbListRet = new Array<GroupedAvailabilities>();
                  Object.keys(grouped).forEach((key) => {
                    const parsed: GroupedAvailabilities = new GroupedAvailabilities();
                    parsed.stopName = key;
                    arr.push(key);
                    parsed.availabilities = grouped[key];
                    this.avbListRet.push(parsed);
                  });
                  for (const stop of busride.stopBuses) {
                    for (const avb of this.avbListRet) {
                      if (stop.name === avb.stopName) {
                        avb.startTime = stop.hours;
                      }
                    }
                    if (arr.includes(stop.name) === false) {
                      const parsed: GroupedAvailabilities = new GroupedAvailabilities();
                      parsed.stopName = stop.name;
                      parsed.startTime = stop.hours;
                      parsed.availabilities = null;
                      this.avbListRet.push(parsed);
                    }
                  }
                  this.avbListRet.sort((a, b) => {
                    return a.startTime - b.startTime;
                  });
                  if (this.dataSelected === this.today()) {
                    const now = new Date();
                    const seconds = (now.getHours() * 60) + now.getMinutes() ;
                    if (this.avbListRet[0].startTime <= seconds) {
                      this.avbListRet = undefined;
                    }
                  }
                  this.loadingRet = false;
                },
                (error) => {
                  this.alertService.error(error);
                }
              );
          },
          (error) => {
            this.loadingRet = false;
            this.avbListRet = undefined;
          }
        );
    }
  }

  changeLine(event) {
    this.lineSelected = new LineEnum();
    this.lineSelected.idLine = event.target.value;
    for (const x of this.lines) {
      if (this.lineSelected.idLine === x.idLine) {
        this.lineSelected = x;
      }
    }
    this.getAvailabilities();
  }

  getUserName(idUser: string): string {
    let name = '';
    console.log(idUser);
    this.userService.findById(idUser)
      .subscribe(
        (data) => {
          console.log(data);
          name = data.firstname + ' ' + data.surname;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    return name;
  }

  updateAvailability(idStopBus: string, state: AvailabilityState, id: string) {
    const avbPut: AvailabilityPUT = new AvailabilityPUT();
    avbPut.idStopBus = idStopBus;
    if (state === AvailabilityState.available) {
      avbPut.state = AvailabilityState.checked;
    }
    if (state === AvailabilityState.readChecked) {
      avbPut.state = AvailabilityState.confirmed;
    }
    this.availabilityService.updateAvailability(avbPut, id)
      .subscribe(
        (data) => {
          this.alertService.success('Availability updated');
          this.getAvailabilities();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  clearAllAvilabilties(direction: string) {
    if (direction.localeCompare('out') === 0) {
      for (const list of this.avbListOut) {
        for (const data of list.availabilities) {
          if (data.state === AvailabilityState.confirmed) {
          const avbPut: AvailabilityPUT = new AvailabilityPUT();
          avbPut.idStopBus = data.idStopBus;
          avbPut.state = AvailabilityState.available;
          const id: string = data.id;
          this.availabilityService.updateAvailability(avbPut, id)
            .subscribe(
              (cleared) => {
                this.alertService.success('Availability updated');
              },
              (error) => {
                this.alertService.error(error);
              }
            );
          }
        }
      }
    } else {
      for (const list of this.avbListRet) {
        for (const data of list.availabilities) {
          if (data.state === AvailabilityState.confirmed) {
            const avbPut: AvailabilityPUT = new AvailabilityPUT();
            avbPut.idStopBus = data.idStopBus;
            avbPut.state = AvailabilityState.available;
            this.availabilityService.updateAvailability(avbPut, data.id)
              .subscribe(
                (cleared) => {
                  this.alertService.success('Availability updated');
                },
                (error) => {
                  this.alertService.error(error);
                }
              );
          }
        }
      }
    }
  }

  deleteBusride(direction: string) {
    let id: string;
    if (direction.localeCompare('out') === 0) {
      id = this.busRideOut;
    } else if (direction.localeCompare('ret') === 0) {
      id = this.busRideRet;
    }
    this.busrideService.deleteBusride(id)
      .subscribe(
        (data) => {
          this.alertService.success('BusRide cancellata');
          if (direction.localeCompare('out') === 0) {
            this.avbListOut = undefined;
          } else if (direction.localeCompare('ret') === 0) {
            this.avbListRet = undefined;
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  changeState(state: AvailabilityState): boolean {
    if (state === AvailabilityState.available || state === AvailabilityState.readChecked) {
      return true;
    } else if (state === AvailabilityState.checked || state === AvailabilityState.confirmed) {
      return false;
    }
  }

  deleteAvailability(id: string) {
    this.availabilityService.deleteAvailability(id)
      .subscribe(
        (data) => {
          this.alertService.success('Availability deleted');
          this.getAvailabilities();
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }
}
