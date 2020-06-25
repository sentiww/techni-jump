// Wczytanie bibliotek (a w większości wtyczek do rollup.js).
import typescript from 'rollup-plugin-typescript2'
import copy from 'rollup-plugin-copy'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import replace from '@rollup/plugin-replace'
import del from 'rollup-plugin-delete'
import { uglify } from "rollup-plugin-uglify";

// Sprawdzam czy wskazano środowisko, a dokładniej konfigurację, wg której ma zostać zbudowany projekt.
// Wybranie konfiguracji włącza/wyłącza niektóre funkcje.
const args = require('args-parser')(process.argv);
const environment = args.environment || 'development';

// Definiujemy zbiór wtyczek, przy pomocy których zostanie zbudowany projekt.
const plugins = [];

// Jeżeli wybrano konfigurację produkcyjną to wyczyść katalog `dist`.
// Służy ot usunięciu plików pomocniczych, tj. sourcemaps.
if (environment === 'production') {
    plugins.push(del({ targets: 'dist/*' }));
}

// Piszemy w TS, więc musimy go skompilować do czystego JS-a.
plugins.push(typescript({
    lib: ["es5", "es6", "dom"],
    target: "es5"
}));

// Podmiana zmiennych w kodzie podczas budowania projektu.
plugins.push(replace({ 
    __buildEnv__: environment
}));

// W przypadku konfiguracji produkcyjnej, wynikowy plik zostanie zminifikowany (tzn. zmniejszony).
// Zobacz definicję tu: https://pl.wikipedia.org/wiki/Minifikacja.
if (environment === 'production') {
    plugins.push(uglify());
}

// Kopiowanie zasobów statycznych (pliki HTML, CSS, zasoby gry, itd.) w tym samego Phaser-a.
plugins.push(copy({
    targets: [
        { src: 'node_modules/phaser/dist/phaser.min.js', dest: 'dist' },
        { src: 'src/html/index.html', dest: 'dist' },
        { src: 'src/html/favicon.ico', dest: 'dist' },
        { src: 'src/assets', dest: 'dist' },
    ]
}));

// Uruchomienie serwera z zbudowany projektem pod portem 3000.
plugins.push(serve({
    open: true,
    contentBase: 'dist',
    host: 'localhost',
    port: 3000,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
}));

// W przypadku konfiguracji innej niż produkcyjna, uruchomiana w przeglądarce strona będzie automatycznie przeładowana.
if (environment !== 'production') {
    plugins.push(livereload('dist'));
}

// Konfiguracja rollup.js.
export default {
    input: [
        './src/game.ts'
    ],
    output: {
        file: './dist/game.js',
        name: 'Phaser3Boilerplate',
        format: 'iife',
        sourcemap: environment === 'production' ? false : true
    },
    external: [ 'phaser' ],
    plugins: plugins
};
