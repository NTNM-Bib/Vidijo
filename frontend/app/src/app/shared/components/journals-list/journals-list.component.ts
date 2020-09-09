import { Component, OnInit, Input } from '@angular/core';
import { IJournal } from 'src/app/journals/shared/journal.interface';
import { NavigationService } from 'src/app/core/navigation/navigation.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { AdminService } from 'src/app/admin/shared/admin.service';
import { AlertService } from 'src/app/core/alert/alert.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-journals-list',
  templateUrl: './journals-list.component.html',
  styleUrls: ['./journals-list.component.scss']
})
export class JournalsListComponent implements OnInit {

  @Input() journals: IJournal[] = [];
  @Input() showAddButton: boolean = false;
  @Input() showInstallButton: boolean = false;

  isMobile: boolean;
  // Array with journal IDs that are currently installed or added to a category
  isAdding: BehaviorSubject<IJournal[]> = new BehaviorSubject<IJournal[]>([]);
  isInstalling: BehaviorSubject<IJournal[]> = new BehaviorSubject<IJournal[]>([]);


  constructor(
    private breakpointObserver: BreakpointObserver,
    private adminService: AdminService,
    private alertService: AlertService
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }


  removeFromJournalIdArray(array: IJournal[], journal: IJournal) {
    array = array.filter((value: IJournal) => {
      return value !== journal;
    });
  }


  // TODO: DISABLE BUTTON WHEN INSTALLING
  install(journal: IJournal) {
    this.adminService.addJournal(journal)
      .then(() => {
        this.alertService.showSnackbarAlert(`Added journal ${journal.title}`, "Okay", () => { });
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(`Cannot add journal ${journal.title}`, "Retry", () => {
          this.install(journal);
        }, 5000, true);
      });
  }

  
  addToCategory(journal: IJournal, categoryId: string) {
    // TODO: IMPLEMENT
  }

}
