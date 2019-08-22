import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './components/home/home.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AlertComponent} from './components/alert/alert.component';
import {ErrorInterceptor} from './interceptors/error.interceptor';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {CreateUserComponent} from './components/create-user/create-user.component';
import {JwtInterceptor} from './interceptors/jwt.interceptor';
import {ChildrenComponent} from './components/manageChild/children/children.component';
import { RegisterChildComponent } from './components/manageChild/register-child/register-child.component';
import { UpdateChildComponent } from './components/manageChild/update-child/update-child.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { ComunicationComponent } from './components/comunication/comunication.component';
import {Message} from './models/message';
import { MessageComponent } from './components/message/message.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'forgotPassword', component: ForgotPasswordComponent},
  {path: 'createUser', component: CreateUserComponent},
  {path: 'children', component: ChildrenComponent},
  {path: 'reservation', component: ReservationComponent},
  {path: 'messages', component: ComunicationComponent},
  {path: 'messages/:id', component: MessageComponent},
  {path: 'children/register', component: RegisterChildComponent},
  {path: 'children/update/:id', component: UpdateChildComponent},
  {path: 'home', component: HomeComponent},
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AlertComponent,
    ForgotPasswordComponent,
    CreateUserComponent,
    ChildrenComponent,
    RegisterChildComponent,
    UpdateChildComponent,
    ReservationComponent,
    ComunicationComponent,
    MessageComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {enableTracing: true}),
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
