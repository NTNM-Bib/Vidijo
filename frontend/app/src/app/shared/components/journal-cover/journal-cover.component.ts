import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { IJournal } from "../../../journals/shared/journal.interface";
import { IColor } from "../../../journals/shared/color.interface";
import * as Color from "color";

@Component({
  selector: "app-journal-cover",
  templateUrl: "./journal-cover.component.html",
  styleUrls: ["./journal-cover.component.scss"],
})
export class JournalCoverComponent implements OnInit, OnChanges {
  @Input() journal: IJournal;
  triedLoadingCover: boolean = false;
  coverLoadedSuccessfully: boolean = false;

  // The colors of the generated cover
  colors: {
    font: string;
    background: string;
    first: string;
    second: string;
    third: string;
  } = {
    font: "",
    background: "",
    first: "",
    second: "",
    third: "",
  };

  ngOnInit() {
    this.generateColorsForThisCover();
  }

  ngOnChanges() {
    this.generateColorsForThisCover();
  }

  generateColorsForThisCover() {
    if (!this.journal || !this.journal.title) return;

    // Grey-shaded background colors
    const availableBackgroundColors = [Color("#f2f2f2"), Color("#242424")];
    const backgroundColor =
      availableBackgroundColors[
        this.journal.title.length % availableBackgroundColors.length
      ];

    this.colors.background = backgroundColor.hex();
    this.colors.font = backgroundColor.negate().hex();

    // Colors of decoration
    const availableBaseColors = [
      Color("#e89c0e"),
      Color("#0f9ca3"),
      Color("#a30f52"),
    ];
    const baseColor =
      availableBaseColors[
        this.journal.title.length % availableBaseColors.length
      ];

    this.colors.first = baseColor.hex();
    this.colors.second = baseColor.lighten(0.8).hex();
    this.colors.third = baseColor.lighten(0.6).hex();

    console.log(this.colors);
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
