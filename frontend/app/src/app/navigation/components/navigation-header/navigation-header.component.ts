import { Component, OnInit, HostListener } from "@angular/core";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";
import {
  Router,
  RoutesRecognized,
  NavigationEnd,
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Params,
} from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { IUser } from "src/app/users/shared/user.interface";
import { Location } from "@angular/common";
import { filter } from "rxjs/internal/operators/filter";
import { pairwise } from "rxjs/internal/operators/pairwise";
import { NavigationService } from "src/app/core/navigation/navigation.service";
import { environment } from "src/environments/environment";
import { AdminService } from "src/app/admin/shared/admin.service";
import { AlertService } from "src/app/core/alert/alert.service";

interface NavStackItem {
  route: string;
  title: string;
  icon?: string;
  snapshot?: ActivatedRouteSnapshot;
}

@Component({
  selector: "app-navigation-header",
  templateUrl: "./navigation-header.component.html",
  styleUrls: ["./navigation-header.component.scss"],
})
export class NavigationHeaderComponent implements OnInit {
  isMobile: boolean;

  isLoggedIn: boolean;
  isAdmin: boolean = false;
  adminModeActive: boolean = false;

  institutionName: string = environment.institutionName;
  privacyPolicyUrl: string = environment.privacyPolicyUrl;

  // TODO: Implement online / offline checking (for background sync)
  isOffline: boolean = false;

  previousScrollY: number = 0;
  showFloatingToolbar: boolean = true;

  homePage: string = "/journals";
  baseRoutes: NavStackItem[] = [
    {
      route: "/home",
      title: "Home",
      icon: "home",
    },
    {
      route: "/discover",
      title: "Discover",
      icon: "explore",
    },
    {
      route: "/journals",
      title: "Journals",
      icon: "apps",
    },
    {
      route: "/categories",
      title: "Categories",
      icon: "label",
    },
    {
      route: "/search",
      title: "Search",
      icon: "search",
    },
  ];

  // Keep track of previous locations
  navStack: NavStackItem[] = [];
  hasPreviousLocation: boolean = false;
  previousLocationTitle: string = "";

  showNavigationButtons: boolean = true;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private location: Location,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private adminService: AdminService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.authService.currentUser.subscribe((user: IUser) => {
      this.isLoggedIn = user !== null;
      this.isAdmin = this.isLoggedIn && user.accessLevel === "admin";
      this.homePage = this.isLoggedIn ? "/home" : "/journals";
    });

    this.adminService.adminModeActive$.subscribe((active: boolean) => {
      this.adminModeActive = active;
      // Show or hide admin tab in navbar
      if (active) {
        this.baseRoutes.push({
          route: "/users",
          title: "Users",
          icon: "person",
        });
      } else {
        this.baseRoutes = [
          {
            route: "/home",
            title: "Home",
            icon: "home",
          },
          {
            route: "/discover",
            title: "Discover",
            icon: "explore",
          },
          {
            route: "/journals",
            title: "Journals",
            icon: "apps",
          },
          {
            route: "/categories",
            title: "Categories",
            icon: "label",
          },
          {
            route: "/search",
            title: "Search",
            icon: "search",
          },
        ];
      }
    });

    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        const previousRoute = events[0].urlAfterRedirects;
        this.pushNavStack(previousRoute, "Back", this.activatedRoute.snapshot);
      });

    // ! TODO: ALSO POP NAVSTACK WHEN USING BROWSER NAVIGATION BUTTONS

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.updateNavigation();
      }
    });

    this.breakpointObserver
      .observe(["(min-width: 300px) and (max-width: 1000px)"])
      .subscribe((state: BreakpointState) => {
        this.showNavigationButtons = !state.matches;
      });
  }

  enterAdminMode() {
    this.adminService.enterAdminMode();
    this.alertService.showSnackbarAlert(
      "You are now in admin mode",
      "Okay",
      () => {}
    );
  }

  exitAdminMode() {
    this.adminService.exitAdminMode();
    this.alertService.showSnackbarAlert("Exited admin mode", "Okay", () => {});
  }

  openRegister() {
    this.navigationService.navigateToRegister();
  }

  openInfo() {
    this.navigationService.navigateToInfo();
  }

  openOnboarding() {
    this.navigationService.navigateToOnboarding();
  }

  logout() {
    this.authService.logout();
  }

  scrollToTopIfNeeded(pathname: string) {
    if (this.router.url.split("?")[0] === pathname.split("?")[0]) {
      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
  }

  // =-- Navigation Stack --=
  // Put the previous location on the stack when navigating to a subpage
  // Pop the value off the stack when going back
  private popNavStack(): NavStackItem {
    return this.navStack.pop();
  }

  private pushNavStack(
    route: string,
    title: string,
    snapshot: ActivatedRouteSnapshot
  ) {
    const navStackItem: NavStackItem = {
      route: route,
      title: title,
      snapshot: snapshot,
    };

    this.navStack.push(navStackItem);
  }

  private resetNavStack() {
    this.navStack = [] as NavStackItem[];
  }

  private updateNavigation() {
    const currentRoute: string = this.router.url.split("?")[0];
    for (let baseRoute of this.baseRoutes) {
      if (baseRoute.route === currentRoute) {
        this.resetNavStack();
        break;
      }
    }

    this.hasPreviousLocation = this.navStack.length > 0;
    this.previousLocationTitle = this.hasPreviousLocation
      ? this.navStack[this.navStack.length - 1].title
      : "";
  }

  // Back button for previous location (mobile)
  backToPreviousLocation() {
    const navStackItem: NavStackItem = this.popNavStack();
    const baseRoute: string = navStackItem.route.split("?", 1)[0];
    const queryParams: Params = navStackItem.snapshot.queryParams;
    this.router
      .navigate([baseRoute], {
        queryParams: queryParams,
      })
      .then(() => {
        // When going back, the previous location is added again (because of router.events.pipe(... in ngOnInit )
        // Remove it directly after navigating to prevent a circular navigation history
        this.popNavStack();
        this.updateNavigation();
      });
  }

  // Pop NavStack when going back via browser navigation
  @HostListener("window:popstate", ["$event"]) onGoingBack() {
    this.backToPreviousLocation();
  }

  // Hide the scrollbar on mobile when scrolling down
  // Show instantly when scrolling up
  // Always show on desktop
  @HostListener("window:scroll") onScroll() {
    const isScrollingUp = window.scrollY < this.previousScrollY;
    this.showFloatingToolbar =
      !this.isMobile || isScrollingUp || window.scrollY <= 0;

    this.previousScrollY = window.scrollY;
  }
}
