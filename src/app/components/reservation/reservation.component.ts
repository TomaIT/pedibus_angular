import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ChildService} from '../../services/child.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {


  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    if (!this.authenticationService.isParent()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => this.onChangePath(params));
  }

  private onChangePath(params: ParamMap) {

  }
}
