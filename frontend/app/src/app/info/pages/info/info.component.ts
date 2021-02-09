import { Component } from "@angular/core";

@Component({
  selector: "app-info",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"],
})
export class InfoComponent {
  institutions = [
    {
      title: "Federal Ministry of Education and Research",
      image: "assets/logos/bmbf-logo.png",
      website: "https://www.bmbf.de/",
    },
    {
      title: "NTNM Library",
      image: "assets/logos/ntnm-logo.png",
      website: "https://www.ntnm-bib.de/",
    },
    {
      title: "Leibniz Institute for New Materials",
      image: "assets/logos/inm-logo.png",
      website: "https://www.leibniz-inm.de/",
    },
    {
      title: "Leibniz Association",
      image: "assets/logos/leibniz-logo.svg",
      website: "https://www.leibniz-gemeinschaft.de/",
    },
  ];

  authors = [
    {
      name: "Uwe Geith",
      role: "Project Manager",
      contact: "uwe.geith@leibniz-inm.de",
    },
    {
      name: "Thomas Kraß",
      role: "Programmer",
      contact: "krass@ntnm-bib.de",
      description: "September 2018 - February 2021",
    },
    {
      name: "Lorena Isabel Jara Toledo",
      role: "Programmer",
      description: "September 2018 - May 2019",
    },
  ];
}
