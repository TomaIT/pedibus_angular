import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {LineService} from '../../services/line.service';
import {Subscription} from 'rxjs';
import {Line, LineEnum, Markers} from '../../models/line';
import {AlertService} from '../../services/alert.service';
import {StopBus, StopBusType} from '../../models/stopbus';

@Component({
  selector: 'app-map-lines',
  templateUrl: './map-lines.component.html',
  styleUrls: ['./map-lines.component.css']
})
export class MapLinesComponent implements OnInit {

  lat = 45.3216300;
  lng = 8.4198900;
  mapType = 'roadmap';

  line: Line;
  lineEnum: Array<LineEnum>;
  markers: Array<Markers>;
  actualLine: string;
  actualDirection: string;
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private lineService: LineService,
              private alertService: AlertService) {
    if (!this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.markers = new Array<Markers>();
    this.lineService.getLinesEnum()
      .subscribe(
        (data) => {
          this.lineEnum = data;
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }


  getLineCoordinates(event) {
    console.log(event.target.value);
    this.markers = new Array<Markers>();
    this.lineService.getLine(event.target.value)
      .subscribe(
        (data) => {
          this.line = data;
          for (const loc of this.line.outStopBuses) {
              const temp: Markers = new Markers();
              temp.lng = loc.location.x;
              temp.lat = loc.location.y;
              temp.alpha = 1;
              temp.type = StopBusType.outward;
              temp.name = loc.name;
              this.markers.push(temp);
          }
          for (const loc of this.line.retStopBuses) {
            const temp: Markers = new Markers();
            temp.lng = loc.location.x;
            temp.lat = loc.location.y;
            temp.type = StopBusType.return;
            temp.alpha = 1;
            temp.name = loc.name;
            this.markers.push(temp);
          }
          console.log(this.markers);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  max(coordType: 'lat' | 'lng'): number {
    return Math.max(...this.markers.map(marker => marker[coordType]));
  }

  min(coordType: 'lat' | 'lng'): number {
    return Math.min(...this.markers.map(marker => marker[coordType]));
  }

  doSomething() {

  }
}
