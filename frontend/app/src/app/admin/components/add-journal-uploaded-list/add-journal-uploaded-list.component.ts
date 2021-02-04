import { Component, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { AdminService } from "../../shared/admin.service";

@Component({
  selector: "app-add-journal-uploaded-list",
  templateUrl: "./add-journal-uploaded-list.component.html",
  styleUrls: ["./add-journal-uploaded-list.component.scss"],
})
export class AddJournalUploadedListComponent implements OnInit {
  finishedLoadingCurrentFile$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  finishedLoadingPreviousVersions$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  currentFile$: Observable<{ name: string; time: number }>;
  previousVersions$: Observable<{ name: string; time: number }[]>;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.currentFile$ = this.adminService.getUploadedFiles().pipe(
      map((data) => {
        if (!data?.length) return null;
        return data.sort((a, b) => b.time - a.time)[0];
      }),
      tap((_) => {
        this.finishedLoadingCurrentFile$.next(true);
      })
    );

    this.previousVersions$ = this.adminService.getUploadedFiles().pipe(
      map((data) => {
        if (!data?.length) return null;
        return data.sort((a, b) => b.time - a.time).splice(1, data.length);
      }),
      tap((_) => {
        this.finishedLoadingPreviousVersions$.next(true);
      })
    );
  }
}
