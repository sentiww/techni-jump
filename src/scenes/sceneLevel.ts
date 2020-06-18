import LevelGenerator from '../levelgenerator';

export default class Level extends Phaser.Scene
{
  private LevelGenerator: LevelGenerator = new LevelGenerator();

  constructor () {
    super('level');
  }

  preload () {
    this.load.tilemapTiledJSON('mapSegments', 'assets/mapSegments.json');
    this.load.image('tileset', 'assets/tileset.png')
  }

  create() {

  }
}
