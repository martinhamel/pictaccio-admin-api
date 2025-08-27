import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { homedir } from "node:os";
import closureCompiler from 'google-closure-compiler';
import gulp from 'gulp';
import gulpConcat from 'gulp-concat';
import gulpClean from 'gulp-clean';
import gulpSassConstructor from 'gulp-sass';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpStripComments from 'gulp-strip-comments';
import gulpTypescript from 'gulp-typescript';
import * as sass from 'sass';
import {SourceMapConsumer, SourceMapGenerator} from 'source-map';
import {Transform} from 'stream';
import {minify} from 'uglify-js';
import gutil from 'gulp-util';

gutil.log = gutil.noop;

const gulpSass = gulpSassConstructor(sass);
const gulpClosureCompiler = closureCompiler.gulp();
const tsProject = gulpTypescript.createProject('./src_client/scripts/tsconfig.json');
const dirs = {
    in: {
        dist: ['./dist/*'],
        distWithoutPublic: ['./dist/**/*.js', '!./dist/public/'],
        docPages: './src/http/views/doc_pages/**/*.md',
        frontendScripts: './src_client/scripts/**/*.ts',
        frontendScriptDir: './src_client/scripts/',
        locales: './src/locales/**/*.yaml',
        publicScript: './dist/public/js/app.js',
        scss: './src_client/scss/**/*.scss',
        templates: './src/http/web/views/templates/**/*',
        temporary: ['./build/bundle.min.js'],
    },
    out: {
        dist: '../../dist/app/admin-api/src',
        docPages: '../../dist/app/admin-api/src/http/views/doc_pages/',
        css: '../../dist/app/admin-api/src/public/css/',
        locales: '../../dist/app/admin-api/src/locales/',
        publicScript: '../../dist/app/admin-api/src/public/js/',
        templates: '../../dist/app/admin-api/src/http/web/views/templates/'
    },
    outProd: {
        dist: '/app/app/admin-api/src',
        docPages: '/app/app/admin-api/src/http/views/doc_pages/',
        css: '/app/app/admin-api/src/public/css/',
        locales: '/app/app/admin-api/src/locales/',
        publicScript: '/app/app/admin-api/src/public/js/',
        templates: '/app/app/admin-api/src/http/web/views/templates/'
    }
}

export async function buildDockerAlpha() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const qaUnsafe = (await readFile(join('.', 'Dockerfile.unsafe'))).toString();
        const alphaSafe = (await readFile(join('.', 'Dockerfile.alphaSafe'))).toString();

        await dockerBuild('pictaccio-admin-api-alpha-unsafe', qaUnsafe, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
        await dockerBuild('pictaccio-admin-api-alpha', alphaSafe, {
            APP_BUILD: appBuild
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerBeta() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const qaUnsafe = (await readFile(join('.', 'Dockerfile.unsafe'))).toString();
        const betaSafe = (await readFile(join('.', 'Dockerfile.betaSafe'))).toString();

        await dockerBuild('pictaccio-admin-api-beta-unsafe', qaUnsafe, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
        await dockerBuild('pictaccio-admin-api-beta', betaSafe, {
            APP_BUILD: appBuild
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerProd() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const qaUnsafe = (await readFile(join('.', 'Dockerfile.unsafe'))).toString();
        const prodSafe = (await readFile(join('.', 'Dockerfile.prodSafe'))).toString();

        await dockerBuild('pictaccio-admin-api-prod-unsafe', qaUnsafe, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
        await dockerBuild('pictaccio-admin-api-prod', prodSafe, {
            APP_BUILD: appBuild
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerWinter24() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const qaUnsafe = (await readFile(join('.', 'Dockerfile.unsafe'))).toString();
        const fall23Safe = (await readFile(join('.', 'Dockerfile.winter24Safe'))).toString();

        await dockerBuild('pictaccio-admin-api-winter24-unsafe', qaUnsafe, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
        await dockerBuild('pictaccio-admin-api-winter24', fall23Safe, {
            APP_BUILD: appBuild
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerTest() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const qaUnsafe = (await readFile(join('.', 'Dockerfile.unsafe'))).toString();
        const testSafe = (await readFile(join('.', 'Dockerfile.testSafe'))).toString();

        await dockerBuild('pictaccio-admin-api-test-unsafe', qaUnsafe, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
        await dockerBuild('pictaccio-admin-api-test', testSafe, {
            APP_BUILD: appBuild
        });
    } catch (error) {
        throw error;
    }
}

/* PRE COMPILE FUNCTIONS */
function cleanFrontendSource() {
    return gulp.src(dirs.in.publicScript)
        .pipe(gulpClean());
}

/* POST COMPILE FUNCTIONS */
function compileCss(target) {
    return gulp.src(dirs.in.scss)
        .pipe(gulpSass.sync().on('error', gulpSass.logError))
        .pipe(gulp.dest(dirs[target].css));
}

function compileFrontend(target) {
    return Promise.all([
        gulp.src(dirs.in.frontendScripts)
            .pipe(gulpSourcemaps.init())
            .pipe(tsProject())
            .pipe(new Transform({
                objectMode: true,
                transform(object, encoding, callback) {
                    const upstreamSourceMap = new SourceMapConsumer(object.sourceMap);

                    if (object.contents) {
                        let contents = object.contents.toString();
                        let packageName = object.history[object.history.length - 1];

                        packageName = relative(dirs.in.frontendScriptDir, packageName).slice(0, -3);

                        if (process.platform === 'win32') {
                            packageName = packageName.replaceAll('\\', '/');
                        }

                        object.contents = Buffer.from(
                            contents
                                .replaceAll(/\n\s*define\(\[/g, `define("${packageName}", [`)
                        );

                        upstreamSourceMap.eachMapping((...args) => {
                            //debugger;
                        });
                    }
                    callback(null, object);
                },
            }))
            .pipe(new Transform({
                objectMode: true,
                transform(object, encoding, callback) {
                    const upstreamSourceMap = new SourceMapConsumer(object.sourceMap);

                    if (object.contents) {
                        const content = object.contents.toString();
                        upstreamSourceMap.eachMapping((mapping) => {
                            const test = content;
                        });
                    }
                    callback(null, object);
                },
            }))
            .pipe(gulpConcat('app.min.js'))
            .pipe(new Transform({
                objectMode: true,
                transform(object, encoding, callback) {
                    const upstreamSourceMap = new SourceMapConsumer(object.sourceMap);
                    const downstreamSourceMap = new SourceMapGenerator({file: basename(object.history[object.history.length - 1])});
                    const contentFromBefore = object.contents.toString();

                    object.sourceMap.sources = object.sourceMap.sources.map(
                        source => source.replace('../../../src_client/scripts/', ''));

                    object.contents = Buffer.from(
                        object.contents.toString().replaceAll(/\/index/g, '') + '\nrequire(["lib/entry"]);'
                    );

                    const content = object.contents.toString();
                    upstreamSourceMap.eachMapping((mapping) => {
                        downstreamSourceMap.addMapping({
                            generated: {
                                line: mapping.generatedLine - 1 >= 1 ? mapping.generatedLine - 1 : 1,
                                column: mapping.generatedColumn
                            },
                            original: {
                                line: mapping.originalLine,
                                column: mapping.originalColumn
                            },
                            source: mapping.source,
                            name: mapping.name
                        });
                    });

                    object.sourceMap = JSON.parse(downstreamSourceMap.toString());

                    callback(null, object);
                }
            }))
            .pipe(gulpSourcemaps.write('.'))
            .pipe(gulp.dest(dirs[target].publicScript)),

            gulp.src([
                'node_modules/requirejs/require.js',
                'node_modules/tslib/tslib.js',
                'node_modules/reflect-metadata/Reflect.js',
                'build/typedi.umd.js',
                'node_modules/@loufa/loufairy/dist/bundle/bundle.js',
                'build/mitt.umd.js'
            ])
            // .pipe(gulpStripComments())
            .pipe(gulpConcat('bundle.min.js'))
            .pipe(gulp.dest(dirs[target].publicScript))
    ]);
}

function copyDocPages(target) {
    return gulp.src(dirs.in.docPages)
        .pipe(gulp.dest(dirs[target].docPages));
}

function copyLocales(target) {
    return gulp.src(dirs.in.locales)
        .pipe(gulp.dest(dirs[target].locales));
}

function copySourcesToPublic(target) {
    return gulp.src(dirs.in.frontendScripts)
        .pipe(gulp.dest(dirs[target].publicScript));
}

function copyTemplates(target) {
    return gulp.src(dirs.in.templates)
        .pipe(gulp.dest(dirs[target].templates));
}

function dockerBuild(targetName, dockerfile, variables) {
    return new Promise((resolve, reject) => {
        const docker = spawn(
            'docker',
            ['build', '-f-', '-t', targetName, '../../'],
            {stdio: ['pipe', process.stdout, process.stderr]}
        );

        if (docker && docker.stdin) {
            for (const [key, value] of Object.entries(variables)) {
                dockerfile = dockerfile.replaceAll(`<%= ${key} %>`, value);
            }
            docker.addListener('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error('Docker build failed'));
                }
            })
            docker.stdin.addListener('error', (error) => {
                reject(error);
            })
            docker.stdin.write(dockerfile);
            docker.stdin.end();
        }
    });
}

function getCurrentTag() {
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['describe', '--contains', '--tags'], {stdio: ['pipe', 'pipe', 'pipe']});
        let stdout = '';
        let stderr = '';

        if (git && git.stdout) {
            git.stderr.addListener('data', (chunk) => {
                stderr += chunk.toString();
            });
            git.stdout.addListener('data', (chunk) => {
                stdout += chunk.toString();
            });
            git.stdout.addListener('end', () => {
                if (stderr !== '') {
                    reject(new Error('Missing tag on current branch'));
                } else {
                    resolve(stdout);
                }
            });
        }
    });
}

function minifyBackend(target) {
    return gulp.src(dirs.in.distWithoutPublic)
        .pipe(new Transform({
            objectMode: true,
            transform(object, encoding, callback) {
                if (object.contents) {
                    object.contents =
                        Buffer.from(minify(
                            object.contents.toString()).code, {mangle: true});
                }
                callback(null, object);
            },
        }))
        .pipe(gulp.dest(dirs[target].dist));
}

function minifyFrontend(target) {
    return Promise.all([
        gulpClosureCompiler({
            js: dirs.in.publicScript,
            externs: [
                'node_modules/requirejs/require.js',
                'node_modules/tslib/tslib.js',
                'node_modules/typedi/bundles/typedi.umd.js'
            ],
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            hide_warnings_for: [
                'node_modules/requirejs/require.js',
                'node_modules/tslib/tslib.js',
                'node_modules/typedi/bundles/typedi.umd.js'
            ],
            jscomp_off: 'externsValidation',
            language_in: 'ECMASCRIPT6_STRICT',
            language_out: 'ECMASCRIPT5_STRICT',
            output_wrapper: '(function(){\n%output%\n}).call(this)',
            js_output_file: 'app.min.js'
        })
        .src() // needed to force the plugin to run without gulp.src
        .pipe(gulpStripComments())
        .pipe(gulp.dest(dirs[target].publicScript)),

        gulpClosureCompiler({
            js: [
                'node_modules/requirejs/require.js',
                'node_modules/tslib/tslib.js',
                'build/typedi.umd.js'
            ],
            compilation_level: 'WHITESPACE_ONLY',
            warning_level: 'QUIET',
            language_in: 'ECMASCRIPT6_STRICT',
            language_out: 'ECMASCRIPT5_STRICT',
            output_wrapper: '%output%',
            js_output_file: 'bundle.min.js'
        })
            .src()
            /*gulp.src([
                'node_modules/requirejs/require.js',
                'node_modules/tslib/tslib.js',
                'build/typedi.umd.js'
            ])*/
            .pipe(gulpStripComments())
            .pipe(gulpConcat('bundle.min.js'))
            .pipe(gulp.dest(dirs[target].publicScript))
    ]);
}

/* EXPORTS */
export const buildFrontend = gulp.series(
    compileFrontend,
    copyTemplates,
    // copyTemporaryFiles,
    compileCss,
    copyDocPages
);

export const postCompileTasks = gulp.series(
    //compileFrontend,
    copyTemplates.bind(null, 'out'),
    // copyTemporaryFiles,
    compileCss.bind(null, 'out'),
    copySourcesToPublic.bind(null, 'out'),
    copyLocales.bind(null, 'out'),
    copyDocPages.bind(null, 'out')
);

export const postCompileTasksProd = gulp.series(
    minifyBackend.bind(null, 'outProd'),
    copyTemplates.bind(null, 'outProd'),
    compileCss.bind(null, 'outProd'),
    copyLocales.bind(null, 'outProd'),
    copyDocPages.bind(null, 'outProd')
);
