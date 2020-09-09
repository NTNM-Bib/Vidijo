import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { JournalsModule } from '../journals/journals.module';
import { UsersRoutingModule } from './users-routing.module';
import { RegisterComponent } from './pages/register/register.component';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    JournalsModule,
    UsersRoutingModule
  ],
  declarations: [LoginComponent, HomeComponent, RegisterComponent, ReadingListComponent]
})
export class UsersModule { }
