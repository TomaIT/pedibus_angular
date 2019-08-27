import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {AlertService} from '../../../services/alert.service';
import {ChildService} from '../../../services/child.service';
import {Router} from '@angular/router';
import {Child} from '../../../models/child';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent implements OnInit {
  children: Array<Child>;


  constructor(private alertService: AlertService,
              private childService: ChildService,
              private authenticationService: AuthenticationService,
              private router: Router) {
    if (!this.authenticationService.isParent()) {
      this.router.navigate(['/home']).catch((reason) => this.alertService.error(reason));
    }
  }

  ngOnInit() {
    this.childService.getChildrenByUser(this.authenticationService.currentUserValue.username)
      .subscribe(
        (data) => {
          this.children = data.filter(x => x.isDeleted === false);
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }

  deleteChild(a: Child) {
    this.childService.deleteById(a.id)
      .subscribe(
        (data) => {
          const index = this.children.findIndex(x => x.id === a.id);
          if (index >= 0) {
            this.children.splice(index, 1);
          }
          this.alertService.success('Bambino ' + a.firstname + ' cancellato con successo.');
        },
        (error) => {
          this.alertService.error(error);
        }
      );
  }
}
