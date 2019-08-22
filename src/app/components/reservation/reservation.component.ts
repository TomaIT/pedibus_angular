import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {ChildService} from '../../services/child.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Child} from '../../models/child';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  children: Array<Child>;
  childSelected: Child;


  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router) {
    if (!this.authenticationService.isParent()) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.childService.findByIdUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.children = data.filter(x => !x.isDeleted);
          if (this.children.length > 0) {
            this.childSelected = this.children[0];
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  childSelectedChange() {
    alert(this.childSelected.surname);
  }
}
