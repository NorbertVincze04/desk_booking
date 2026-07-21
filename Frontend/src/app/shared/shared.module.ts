import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ShadowBoxComponent } from './ui-wrappers/shadow-box/shadow-box.component';
import { MainDivComponent } from './ui-wrappers/main-div/main-div.component';
import { HeaderComponent } from './components/header/header.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';
import { RouterModule } from '@angular/router';
import { routes } from '../app-routes';
import { CalendarComponent } from './components/calendar/calendar.component';
import { TableComponent } from './components/table/table.component';
import { MapComponent } from './components/map/map.component';
import { AuthDivComponent } from './ui-wrappers/auth-div/auth-div.component';

@NgModule({
  declarations: [
    ShadowBoxComponent,
    MainDivComponent,
    MapComponent,
    HeaderComponent,
    TopBarComponent,
    ActionButtonComponent,
    ErrorNotificationComponent,
    CalendarComponent,
    TableComponent,
    AuthDivComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    FormsModule,
    DatePickerModule,
  ],
  exports: [
    ShadowBoxComponent,
    MainDivComponent,
    MapComponent,
    HeaderComponent,
    TopBarComponent,
    ActionButtonComponent,
    ErrorNotificationComponent,
    CalendarComponent,
    TableComponent,
    AuthDivComponent,
  ],
})
export class SharedModule {}
