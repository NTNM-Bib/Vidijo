import {
  Component,
  OnInit,
  Input,
  HostListener,
  AfterViewInit
} from "@angular/core";

import { IJournal } from "../../shared/journal.interface";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-journal-grid",
  templateUrl: "./journal-grid.component.html",
  styleUrls: ["./journal-grid.component.scss"]
})
export class JournalGridComponent implements OnInit {
  // Journals to display in this grid
  @Input() journals: IJournal[];
  @Input() specialIndicatorValue: "none" | "latestPubdate" | "added" | "views" = "none";

  specialIndicatorText: string = "";

  cols: number;

  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.onWindowResize();
  }

  @HostListener("window:resize")
  onWindowResize() {
    //this.cols = Math.floor(window.innerWidth / 550) + 2;
    this.cols = (Math.floor(window.innerWidth / 550) + 2 > 6) ? 6 : Math.floor(window.innerWidth / 550) + 2;
  }

  showSpecialIndicator(journal: IJournal) {
    switch (this.specialIndicatorValue) {
      case "none":
        return false;
      case "latestPubdate":
        this.specialIndicatorText = this.datePipe.transform(journal.latestPubdate);
        return journal.latestPubdate;
      case "added":
        this.specialIndicatorText = this.datePipe.transform(journal.added);
        return journal.added;
      case "views":
        //this.specialIndicatorText = journal.views.toString();
        //return journal.views;
        return false;
    }
  }
}
