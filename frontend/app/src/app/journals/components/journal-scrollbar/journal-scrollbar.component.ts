import { Component, OnInit, Input, Output, EventEmitter, HostListener } from "@angular/core";

@Component({
  selector: "app-journal-scrollbar",
  templateUrl: "./journal-scrollbar.component.html",
  styleUrls: ["./journal-scrollbar.component.scss"]
})
export class JournalScrollbarComponent {
  @Input() letters: string[];
  @Output() scrollTo = new EventEmitter<string>();

  letterHeight: number = 45;
  scale: number = 1;
  scaleString: string = "scale(1)";

  ngOnChanges() {
    // On Initialization, letters has length = 0
    // After ngOnChanges, it contains the correct values
    this.computeScale();
  }

  scrollToJournal(startingLetter: string) {
    this.scrollTo.emit(startingLetter);
  }

  @HostListener("window:resize")
  computeScale() {
    const windowHeight: number = window.innerHeight;
    const scrollbarHeight: number = this.letters.length * this.letterHeight;
    const computedScale: number = windowHeight / scrollbarHeight;
    this.scale = (computedScale < 1) ? computedScale : 1;
    this.scaleString = `scale(${this.scale})`;
  }
  
}
