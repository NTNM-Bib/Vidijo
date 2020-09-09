import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { filter, map, mergeMap } from "rxjs/operators";
import { IsLoadingService } from "@service-work/is-loading";
import { BreakpointObserver, BreakpointState, Breakpoints } from "@angular/cdk/layout";
import { slideInAnimation } from "./animations";
import { Title } from '@angular/platform-browser';
import { OpenService } from './core/open/open.service';


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  animations: [
    slideInAnimation
  ]
})
export class AppComponent implements OnInit {

  isMobile: boolean;
  isLoading: Observable<boolean>;

  showMobileToolbar: boolean = false;


  constructor(
    private isLoadingService: IsLoadingService,
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private openService: OpenService  // Keep service in here to perform opening of dialogs etc
  ) { }


  ngOnInit() {
    this.isLoading = this.isLoadingService.isLoading$();

    // Set page title that is defined in app-routing.module
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route: any) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route: any) => route.data)).subscribe((event) => {
        this.titleService.setTitle(event['title']);
      });

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.breakpointObserver
      .observe(["(min-width: 300px) and (max-width: 1000px)"])
      .subscribe((state: BreakpointState) => {
        this.showMobileToolbar = state.matches;
      });
  }


  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData["animation"];
  }


}
