import LevelGenerator from '../levelgenerator';

export default class Level extends Phaser.Scene
{
  private levelGenerator: LevelGenerator;

  private tileset: any;

  constructor () {
    super('level');
  }

  preload () {
    this.load.tilemapTiledJSON('mapSegments', 'assets/mapSegments.json');
    this.load.image('tileset', 'assets/tileset.png')
  }

  create() {
    let map: Phaser.Tilemaps.Tilemap =
        this.make.tilemap({key: 'mapSegments'});

    this.levelGenerator = new LevelGenerator(map);
    this.tileset = map.addTilesetImage(map.tilesets[0].name, 'tileset');

  }
}
