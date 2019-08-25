import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './components/home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AlertComponent} from './components/alert/alert.component';
import {ErrorInterceptor} from './interceptors/error.interceptor';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {CreateUserComponent} from './components/create-user/create-user.component';
import {JwtInterceptor} from './interceptors/jwt.interceptor';
import {ChildrenComponent} from './components/manageChild/children/children.component';
import {RegisterChildComponent} from './components/manageChild/register-child/register-child.component';
import {UpdateChildComponent} from './components/manageChild/update-child/update-child.component';
import {ReservationComponent} from './components/reservation/reservation.component';
import {ComunicationComponent} from './components/manageMessage/comunication/comunication.component';
import {MessageComponent} from './components/manageMessage/message/message.component';
import {ManageAttendeesComponent} from './components/attendees/manage-attendees/manage-attendees.component';
import {EscortBusridesComponent} from './components/escort-busrides/escort-busrides.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {ManageUsersComponent} from './components/manageUsers/manage-users/manage-users.component';
import {CreateAvailabilityComponent} from './components/manageAvailability/create-availability/create-availability.component';
import {ViewAvailabilityComponent} from './components/manageAvailability/view-availability/view-availability.component';
import {ShiftManagerComponent} from './components/manageAvailability/shift-manager/shift-manager.component';
import {MapLinesComponent} from './components/map-lines/map-lines.component';
import { ManageUserComponent } from './components/manageUsers/manage-user/manage-user.component';
import {AgmCoreModule} from '@agm/core';

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
  {path: 'attendees/manage/:idBusRide/:idCurrentStopBus', component: ManageAttendeesComponent},
  {path: 'home', component: HomeComponent},
  {path: 'createAvailabilities', component: CreateAvailabilityComponent},
  {path: 'viewAvailabilities', component: ViewAvailabilityComponent},
  {path: 'shiftManage', component: ShiftManagerComponent},
  {path: 'manageUsers', component: ManageUsersComponent},
  {path: 'manageUsers/:id', component: ManageUserComponent},
  {path: 'mapLines', component: MapLinesComponent},
  {path: 'userProfile', component: UserProfileComponent},
  {path: 'busridesEscort', component: EscortBusridesComponent},
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
    MessageComponent,
    ManageAttendeesComponent,
    EscortBusridesComponent,
    UserProfileComponent,
    ManageUsersComponent,
    CreateAvailabilityComponent,
    ViewAvailabilityComponent,
    ShiftManagerComponent,
    MapLinesComponent,
    ManageUserComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {enableTracing: true}),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyCJLZTtvkOWHf2YjAKg0fRZbk9Z-0ksCkM'}),
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
