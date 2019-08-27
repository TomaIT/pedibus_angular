import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LineService} from '../../services/line.service';
import {Line, LineEnum, Markers} from '../../models/line';
import {AlertService} from '../../services/alert.service';
import {StopBus, StopBusType} from '../../models/stopbus';
import toLonLat = ol.proj.toLonLat;

@Component({
  selector: 'app-map-lines',
  templateUrl: './map-lines.component.html',
  styleUrls: ['./map-lines.component.css']
})
export class MapLinesComponent implements OnInit {

  lat = 45.3216300;
  lng = 8.4198900;
  loading: boolean;
  line: Line;
  lineEnum: Array<LineEnum>;
  markers: Array<Markers>;
  actualLine: string;
  actualDirection: string;
  addOverlay: Markers;
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private lineService: LineService,
              private alertService: AlertService,
              private activatedRoute: ActivatedRoute) {
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.markers = new Array<Markers>();
    this.addOverlay = undefined;
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.lineEnum = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }


  private onChangePath(params: ParamMap) {
    this.addOverlay = undefined;
    this.markers = new Array<Markers>();
    const id = params.get('id');
    this.markers = new Array<Markers>();
    if (id !== null) {
      this.loading = true;
      this.lineService.getLine(id.split('_')[0])
        .subscribe(
          (data) => {
            this.line = data;
            this.actualLine = this.line.id;
            this.actualDirection = id.split('_')[1];
            if (this.actualDirection === 'out') {
              for (const loc of this.line.outStopBuses) {
                const temp: Markers = new Markers();
                temp.lng = loc.location.x;
                temp.lat = loc.location.y;
                temp.alpha = 1;
                temp.type = StopBusType.outward;
                const hours = Math.floor(loc.hours / 60);
                const minutes = loc.hours % 60;
                let time: string;
                if (minutes < 10) {
                  time = hours + ':0' + minutes;
                } else {
                  time = hours + ':' + minutes;
                }
                temp.name = loc.name;
                temp.time = time;
                this.markers.push(temp);
              }
            } else {
              for (const loc of this.line.retStopBuses) {
                const temp: Markers = new Markers();
                temp.lng = loc.location.x;
                temp.lat = loc.location.y;
                temp.alpha = 1;
                temp.type = StopBusType.outward;
                const hours = Math.floor(loc.hours / 60);
                const minutes = loc.hours % 60;
                let time: string;
                if (minutes < 10) {
                  time = hours + ':0' + minutes;
                } else {
                  time = hours + ':' + minutes;
                }
                temp.name = loc.name;
                temp.time = time;
                this.markers.push(temp);
              }
            }
            this.loading = false;
          },
          (error) => {
            this.alertService.error(error);
          }
        );
    }
  }

  getLineCoordinates(event) {
      this.actualLine = event.target.value;
      this.prepareNavigation();
  }

  prepareNavigation() {
    if (this.actualDirection !== undefined && this.actualLine !== undefined) {
      this.router.navigate(['/mapLines/', this.actualLine + '_' + this.actualDirection]);
    }
  }

  showInfo(event) {
    const coordinates = toLonLat(event.coordinate);
    console.log(coordinates);

    let smallestDiff: number[] = [];
    smallestDiff[0] = Math.abs(coordinates[0] - this.markers[0].lng);
    smallestDiff[1] = Math.abs(coordinates[1] - this.markers[0].lat);

    for (const x of this.markers) {
      const currentDiff: number[] = [];
      currentDiff[0] = Math.abs(coordinates[0] - x.lng);
      currentDiff[1] = Math.abs(coordinates[1] - x.lat);
      if (currentDiff <= smallestDiff) {
        smallestDiff = currentDiff;
        console.log(x);
        this.addOverlay = x;
      }
    }

    if (this.addOverlay !== undefined) {
      smallestDiff[0] = Math.abs(coordinates[0] - this.addOverlay.lng);
      smallestDiff[1] = Math.abs(coordinates[1] - this.addOverlay.lat);
      console.log(smallestDiff[0] + ' ' + smallestDiff[1]);
      if ((smallestDiff[0] > 0.001) || (smallestDiff[1] > 0.001)) {
        this.addOverlay = undefined;
      }
    }
  }

  deleteDiv() {
    this.addOverlay = undefined;
  }

  getDirection(event) {
    this.actualDirection = event.target.value;
    this.prepareNavigation();
  }
}
