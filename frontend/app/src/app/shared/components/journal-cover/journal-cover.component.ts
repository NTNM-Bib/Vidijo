import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
} from "@angular/core";
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
    title: string;
    titleContainer: string;
    gradientStart: string;
    gradientEnd: string;
  } = {
    title: "",
    titleContainer: "",
    gradientStart: "",
    gradientEnd: "",
  };

  @ViewChild("generatedCoverContainer") generatedCoverContainer: ElementRef;

  constructor() {}

  ngOnInit() {
    this.generateColorsForThisCover();
  }

  ngOnChanges() {
    this.generateColorsForThisCover();
  }

  generateColorsForThisCover() {
    if (!this.journal || !this.journal.title) return;

    // Grey-shaded background colors
    const availableTitleContainerColors = [Color("#f2f2f2"), Color("#242424")];
    const titleContainerColor =
      availableTitleContainerColors[
        this.journal.title.length % availableTitleContainerColors.length
      ];

    this.colors.titleContainer = titleContainerColor.hex();
    this.colors.title = titleContainerColor.negate().hex();

    // Colors of decoration
    const availableGradientBaseColors = [
      Color("#e89c0e"),
      Color("#0f9ca3"),
      Color("#a30f52"),
      Color("#097b67"),
      Color("#d95a00"),
      Color("#a60881"),
    ];
    const gradientBaseColor =
      availableGradientBaseColors[
        this.journal.title.length % availableGradientBaseColors.length
      ];

    this.colors.gradientStart = gradientBaseColor.hex();
    this.colors.gradientEnd = gradientBaseColor.rotate(20).hex();
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

  get titleFontSize() {
    if (!this.generatedCoverContainer) return 0;

    const fontSize = Math.floor(
      this.generatedCoverContainer.nativeElement.offsetWidth / 14
    );

    return fontSize;
  }
}
