import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ComponentDialogComponent } from './component-dialog/component-dialog.component';
import { PortalModule } from '@angular/cdk/portal';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    PortalModule
  ],
  declarations: [
    ComponentDialogComponent
  ],
  exports: [
    ComponentDialogComponent
  ]
})
export class OpenModule { }
