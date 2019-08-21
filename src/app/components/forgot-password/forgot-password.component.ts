import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {AlertService} from "../../services/alert.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {

    // redirect to home if already logged in
    if (this.authenticationService.isAuthenticated()) {
      // alert(JSON.parse(localStorage.getItem('currentUser')).username);
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose(
        [
          Validators.required,
          Validators.email,
          Validators.minLength(6),
          Validators.maxLength(128)
        ]
      )]
    });
    // this.authenticationService.logout();
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService.recovery(this.f.username.value)
      .subscribe(
        (data) => {
          this.router.navigate(['/login']);
          this.alertService.success('Please confirm your recovery in email.');
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }

}
