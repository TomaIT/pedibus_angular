import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from './services/authentication.service';
import {MessageService} from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public authenticationService: AuthenticationService,
              private router: Router,
              private messageService: MessageService) {}

  isAuthenticated(): boolean {
    return this.authenticationService.isAuthenticated();
  }

  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
