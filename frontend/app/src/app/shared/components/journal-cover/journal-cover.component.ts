import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { IJournal } from "../../../journals/shared/journal.interface";
import { IColor } from "../../../journals/shared/color.interface";

@Component({
  selector: "app-journal-cover",
  templateUrl: "./journal-cover.component.html",
  styleUrls: ["./journal-cover.component.scss"],
})
export class JournalCoverComponent implements OnInit, OnChanges {
  @Input() journal: IJournal;
  triedLoadingCover: boolean = false;
  coverLoadedSuccessfully: boolean = false;

  colorsToChooseFrom: IColor[] = [
    { r: 122, g: 30, b: 73 } as IColor,
    { r: 44, g: 143, b: 168 } as IColor,
    { r: 53, g: 68, b: 66 } as IColor,
    { r: 214, g: 107, b: 7 } as IColor,
    { r: 152, g: 54, b: 110 } as IColor,
    { r: 16, g: 175, b: 87 } as IColor,
    { r: 57, g: 108, b: 155 } as IColor,
    { r: 164, g: 37, b: 19 } as IColor,
    { r: 80, g: 80, b: 100 } as IColor,
    { r: 25, g: 133, b: 102 } as IColor,
    { r: 168, g: 57, b: 57 } as IColor,
  ];
  colorsOfThisCover: string[] = [];

  ngOnInit() {
    this.generateColorsForThisCover();
  }

  ngOnChanges() {
    this.generateColorsForThisCover();
  }

  generateColorsForThisCover() {
    if (!this.journal || !this.journal.title) {
      return;
    }

    this.colorsOfThisCover = [];

    const colorIndex: number =
      this.journal.title
        .toLocaleUpperCase()
        .charCodeAt(Math.floor(this.journal.title.length / 2)) %
      this.colorsToChooseFrom.length;
    const selectedColor: IColor = this.colorsToChooseFrom[colorIndex];

    this.colorsOfThisCover.push(this.cssColorString(selectedColor));
    this.colorsOfThisCover.push(this.cssColorString(selectedColor, -10));
    this.colorsOfThisCover.push(this.cssColorString(selectedColor, -20));
    this.colorsOfThisCover.push(this.cssColorString(selectedColor, -30));
  }

  cssColorString(color: IColor, delta: number = 0): string {
    return `rgb(${color.r + delta}, ${color.g + delta}, ${color.b + delta})`;
  }

  handleCoverLoaded() {
    this.triedLoadingCover = true;
    this.coverLoadedSuccessfully = true;
  }

  handleCoverError() {
    this.triedLoadingCover = true;
    this.coverLoadedSuccessfully = false;
  }

  get journalCoverUrl(): string {
    return `/static/covers/${this.journal._id}`;
  }
}
