import Gulp from "gulp";


const paths: any = {
    templates: {
        src: "src/templates/**/*",
        dest: "dist/src/templates/"
    }
}


export function templates() {
    return Gulp.src(paths.templates.src)
        .pipe(Gulp.dest(paths.templates.dest));
}


export function watch() {
    Gulp.watch(paths.templates.src, templates);
}


const build = Gulp.parallel(templates);


export default build;