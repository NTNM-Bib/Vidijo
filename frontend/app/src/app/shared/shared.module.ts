import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { ColorPickerModule } from 'ngx-color-picker';

import { JournalCoverComponent } from './components/journal-cover/journal-cover.component';
import { JournalsListComponent } from './components/journals-list/journals-list.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { HorizontalScrollingContainerComponent } from './components/horizontal-scrolling-container/horizontal-scrolling-container.component';




@NgModule({
  declarations: [
    JournalCoverComponent,
    JournalsListComponent,
    UsersListComponent,
    HorizontalScrollingContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ColorPickerModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ColorPickerModule,

    JournalCoverComponent,
    JournalsListComponent,
    UsersListComponent,
    HorizontalScrollingContainerComponent
  ]
})
export class SharedModule { }
