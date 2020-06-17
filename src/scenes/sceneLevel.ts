import LevelGenerator from '../levelgenerator';

interface segmentsArrInterface {
  data: number[][],
  connections: string,
  name: string
}

export default class Level extends Phaser.Scene
{
  // Object containing all segments as a layers
  private mapSegments: Phaser.Tilemaps.Tilemap;
  // Tileset
  private tileset: Phaser.Tilemaps.Tileset;
  // Array of maps, which are just all segments
  private segmentsArr: segmentsArrInterface[] = [];

  private levelSequence: string[];

  private levelSegments: Phaser.Tilemaps.Tilemap[] = [];
  private levelLayers: Phaser.Tilemaps.StaticTilemapLayer[] = [];

  private LevelGenerator: LevelGenerator = new LevelGenerator();

  constructor () {
    super('level');
  }

  preload () {
    this.load.tilemapTiledJSON('mapSegments', 'assets/mapSegments.json');
    this.load.image('tileset', 'assets/tileset.png')
  }

  create() {
    this.mapSegments = this.make.tilemap({ key: 'mapSegments' });
    this.tileset = this.mapSegments.addTilesetImage('Spier Kaf 2 ', 'tileset');
    this.extractSegments(this.mapSegments);

    this.levelSequence = this.LevelGenerator.generateSequence(this.segmentsArr, 'A', 3);

    this.levelSequence.forEach((el: string) => {
      let data: number[][] =
        this.segmentsArr.find((seg: segmentsArrInterface) => {
                                return seg.name === el;
                              }).data;

        this.levelSegments.push(this.make.tilemap({data: data, tileWidth: 16, tileHeight: 16}));
    })

    console.log(this.levelSegments)
    this.levelSegments.forEach((el: Phaser.Tilemaps.Tilemap, i: number) => {
      this.levelLayers.push(el.createStaticLayer(0, this.tileset, 0, 0));
    })

  }

  private extractSegments(tilemap: Phaser.Tilemaps.Tilemap): void {
    this.segmentsArr = tilemap.layers.map((el: Phaser.Tilemaps.LayerData) => {
      let newData = [];

      for (let i: number; i < el.height; i++) {
        newData.push(el.data.slice(i * 5, el.width));
      }

      return {
        data: newData,
        connections: el.properties[0]['value'],
        name: el.name
      }
    })
  }
}
