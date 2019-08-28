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
import {ManageAttendeesComponent, MyFilterChildrenPipe} from './components/attendees/manage-attendees/manage-attendees.component';
import {EscortBusridesComponent} from './components/escort-busrides/escort-busrides.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {ManageUsersComponent} from './components/manageUsers/manage-users/manage-users.component';
import {CreateAvailabilityComponent} from './components/manageAvailability/create-availability/create-availability.component';
import {ViewAvailabilityComponent} from './components/manageAvailability/view-availability/view-availability.component';
import {ShiftManagerComponent} from './components/manageAvailability/shift-manager/shift-manager.component';
import {MapLinesComponent} from './components/map-lines/map-lines.component';
import {ManageUserComponent} from './components/manageUsers/manage-user/manage-user.component';
import {AgmCoreModule} from '@agm/core';
import {AngularOpenlayersModule} from 'ngx-openlayers';
import {StateBusrideComponent} from './components/state-busride/state-busride.component';
import {JwPaginationComponent} from 'jw-angular-pagination';
import {RoleGuardService} from './services/role-guard.service';
import {Role} from './models/user';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'forgotPassword', component: ForgotPasswordComponent},
  {
    path: 'createUser',
    component: CreateUserComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'children',
    component: ChildrenComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent]
    }
  },
  {
    path: 'reservation', component: ReservationComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent]
    }
  },
  {
    path: 'messages', component: ComunicationComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.escort, Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'messages/:id', component: MessageComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.escort, Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'children/register', component: RegisterChildComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent]
    }
  },
  {
    path: 'children/update/:id', component: UpdateChildComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent]
    }
  },
  {
    path: 'attendees/manage/:idBusRide/:idCurrentStopBus', component: ManageAttendeesComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.escort]
    }
  },
  {path: 'home', component: HomeComponent},
  {
    path: 'createAvailabilities', component: CreateAvailabilityComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.escort]
    }
  },
  {
    path: 'viewAvailabilities', component: ViewAvailabilityComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.escort]
    }
  },
  {
    path: 'shiftManage', component: ShiftManagerComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'shiftManage/:id', component: ShiftManagerComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'manageUsers', component: ManageUsersComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'manageUsers/:id', component: ManageUserComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'mapLines', component: MapLinesComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.escort, Role.admin, Role.sysAdmin]
    }
  },
  {
    path: 'mapLines/:id', component: MapLinesComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.admin, Role.escort, Role.sysAdmin]
    }
  },
  {
    path: 'userProfile', component: UserProfileComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.escort, Role.sysAdmin, Role.admin]
    }
  },
  {
    path: 'busridesEscort', component: EscortBusridesComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.escort]
    }
  },
  {
    path: 'stateBusRide', component: StateBusrideComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.sysAdmin, Role.admin]
    }
  },
  {
    path: 'stateBusRide/:idLine/:stopBusType/:data', component: StateBusrideComponent,
    canActivate: [RoleGuardService],
    data: {
      rolesPermitted: [Role.parent, Role.sysAdmin, Role.admin]
    }
  },
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
    ManageUserComponent,
    MyFilterChildrenPipe,
    StateBusrideComponent,
    JwPaginationComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {enableTracing: true}),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyCJLZTtvkOWHf2YjAKg0fRZbk9Z-0ksCkM'}),
    AngularOpenlayersModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
