import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { BreakpointObserver, Breakpoints, BreakpointState } from "@angular/cdk/layout";

@Component({
  selector: "app-info",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"]
})
export class InfoComponent implements OnInit {

  companyLogosColumns = 4;
  

  constructor(
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        const isMobile: boolean = state.matches;
        this.companyLogosColumns = (isMobile) ? 2 : 4;
      });
  }
}
