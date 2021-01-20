import { Component, OnInit, Input } from "@angular/core";
import { IJournal } from "../../shared/journal.interface";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";
import { NavigationService } from "src/app/core/navigation/navigation.service";
import { AdminService } from "src/app/admin/shared/admin.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-journal-thumbnail",
  templateUrl: "./journal-thumbnail.component.html",
  styleUrls: ["./journal-thumbnail.component.scss"],
})
export class JournalThumbnailComponent implements OnInit {
  @Input() journal: IJournal;
  isMobile: boolean;
  adminModeActive$: Observable<boolean>;

  @Input() showTitle: boolean = true;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private navigationService: NavigationService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.adminModeActive$ = this.adminService.adminModeActive$;
  }

  public openJournal() {
    this.navigationService.navigateToJournal(this.journal._id);
  }

  public navigateToEditJournal() {
    this.navigationService.navigateToEditJournal(this.journal._id);
  }
}
