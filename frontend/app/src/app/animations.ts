import { trigger, transition, style, query, group, animateChild, animate } from "@angular/animations";

export const slideInAnimation =
    trigger('routeAnimations', [
        /**
        transition('* <=> *', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                })
            ], { optional: true }),
            query(':enter', [
                style({ opacity: "0" })
            ], { optional: true }),
            query(':leave', animateChild()),
            group([
                query(':leave', [
                    animate('300ms ease-out', style({ left: '-100%' }))
                ], { optional: true }),
                query(':enter', [
                    animate('300ms ease-in', style({ left: '0' }))
                ], { optional: true })
            ]),
            query(':enter', animateChild()),
        ]),
        /**/
        /*
        transition('* => Discover', [
         style({ position: 'relative' }),
         query(':enter, :leave', [
             style({
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 width: '100%'
             })
         ], { optional: true }),
         query(':enter', [
             style({ opacity: "0" })
         ], { optional: true }),
         query(':leave', animateChild()),
         group([
             query(':leave', [
                 animate('300ms ease-out', style({ left: '-100%' }))
             ], { optional: true }),
             query(':enter', [
                 animate('300ms ease-in', style({ left: '0' }))
             ], { optional: true })
         ]),
         query(':enter', animateChild()),
     ])
     */
    ]);