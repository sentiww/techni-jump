# Phaser 3 Boilerplate _by Chinchilla Games_

Niniejsze repozytorium zawiera skrypty automatyzujące proces budowania oraz szablon projektu gry otworzonego przy pomocy silnika gry **Phaser 3** oraz **Typescript**-u.

Domyślnie szablon został skonfigurowany następująco:
- obsługa grafiki w stylu Pixel Art;
- rozdzielczość gry to 480x270 pikseli, która skalowana jest w górę do aktualnego rozmiaru okna metodą najbliższego sąsiada (najlepsza do grafiki Pixel Art);
- projekt skaluje się zawsze z zachowaniem proporcji oraz tylko o całkowitą wielokrotność, np. 2x (960x540), 3x (1440x810), 4x (1920x1080), ale już nie x2.5;
- przy rozdzielczości _FullHD_ w trybie pełnoekranowym (pełne 1920x1080 pikseli), gra wypełni cały ekran;
- w przypadku innych rozdzielczości ekranu (lub okna przeglądarki) niebędących wielokrotnością rozdzielczości gry, ekran zostanie zeskalowany do najbliższej liczby całkowitej oraz wycentrowany z czarną ramką dookoła, np. dla obszaru o rozmiarze 1600x900, gra zostanie zeskalowana do 1440x810 (3x);
- po uruchomieniu projektu przy pomocy wbudowanej komendy `npm start`, gra zostanie każdorazowo przebudowana i uruchomiona ponownie po każdej zmianie w plikach źródłowych (chyba, że włączono konfigurację produkcyjną);
- szablon zawiera następujące przykładowe sceny:
  - `BootScene`: ustawia tło i przechodzi do sceny _loading_,
  - `LoadingScene`: w niej wczytywane są zasoby gry (dostęp do nich jest globalny),
  - `SplashScene`: wyświetla logo _Chinchilla Games_,
  - `MenuScene`: _placeholder_ dla menu,
  - `GameScene`: _placeholder_ dla gry;
- do automatyzacji procesu budowania wykorzystana została biblioteka **rollup.js**;
- zbudowany projekt znajdzie się w katalogu `dist` (zawiera wszystkie niezbędne pliki do uruchomienia gry);
- dla konfiguracji innych niż produkcyjna do projektu zostaje dodany skrypt **Stats.js** (mały panel w lewym górnym roku ekranu) służący do weryfikacji liczby klatek na sekundę oraz obciążenia pamięci.

## Uruchomienie

Aby uruchomić szablon projektu należy wykorzystać następujące komendy:
```
npm i                                 // jednorazowo instaluje wymagane biblioteki
npm start                             // buduje i uruchamia projekt w trybie deweloperskim
npm start -- --environment=production // buduje i uruchamia projekt w trybie produkcyjnym
```
