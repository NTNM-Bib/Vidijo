import { Component, OnInit, Inject, ComponentRef, ViewChild, Injector, HostListener, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentPortal, PortalOutlet, CdkPortalOutlet } from '@angular/cdk/portal';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-component-dialog',
  templateUrl: './component-dialog.component.html',
  styleUrls: ['./component-dialog.component.scss']
})
export class ComponentDialogComponent implements OnInit, AfterViewInit {

  title: string;

  portal: ComponentPortal<any>;
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet: PortalOutlet;
  portalInstance: ComponentRef<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ComponentDialogComponent>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }


  ngOnInit() {
    this.title = this.data.title;

    this.portal = new ComponentPortal(this.data.component);
    this.portalInstance = this.portal.attach(this.portalOutlet);

    this.setInputs();

    this.updatePosition();
  }


  ngAfterViewInit() {
  }


  @HostListener('window:keyup.esc') onKeyUp() {
    this.closeDialog();
  }


  // TODO: Every possible input option must be hardcoded
  private setInputs() {
    const inputs: any = this.data.inputs;

    if (!inputs) {
      return;
    }

    if (inputs.article) {
      this.portalInstance.instance.article = inputs.article;
    }

    if (inputs.category) {
      this.portalInstance.instance.category = inputs.category;
    }

    if (inputs.journal) {
      this.portalInstance.instance.journal = inputs.journal;
    }

    if (inputs.user) {
      this.portalInstance.instance.user = inputs.user;
    }
  }


  // Change the position of the dialog if specified
  private updatePosition() {
    const position = this.data.position;

    if (position === "top") {
      this.dialogRef.updatePosition({ top: "50px" });
      return;
    }
  }


  public closeDialog() {
    this.dialogRef.close();

    const queryParams = {
      dialog: null,
      dialogData: null
    };

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: "merge"
      }
    );
  }

}
