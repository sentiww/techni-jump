import LevelGenerator from '../levelgenerator';

export default class Level extends Phaser.Scene
{
  private levelGenerator: LevelGenerator;

  private tileset: any;

  private segmentsList: {
    displayed: boolean,
    toDestroy: boolean,
    tilemap: Phaser.Tilemaps.Tilemap,
  }[] = [];

  private lastSegmentData: {
    id: string,
    nextIds: string[],
  } = {id: null, nextIds: []};

  private lastDisplayedSegmentX: number = 0;

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

    this.insertSegment('A');
    for (let i = 0; i < 5; i++) {
      this.insertSegment(this.randomNextSegmentId(this.lastSegmentData.nextIds));
    }
  }

  update() {
    this.segmentsList.filter(segment => segment.displayed === false)
        .forEach(segment => {
          segment.tilemap.createStaticLayer(0, this.tileset, this.lastDisplayedSegmentX, 0);
          this.lastDisplayedSegmentX += segment.tilemap.widthInPixels;
          segment.displayed = true;
          console.log(this.segmentsList, this.lastDisplayedSegmentX)
        })
  }

  private insertSegment(segmentId: string): void {
    let segmentTilemap: any = this.levelGenerator.generateSegment(segmentId);

    this.segmentsList.push({
      displayed: false,
      toDestroy: false,
      tilemap: segmentTilemap,
    })

    this.lastSegmentData = {
      id: segmentTilemap.currentSegment,
      nextIds: segmentTilemap.nextSegments,
    }
  }

  private randomNextSegmentId(nextIds: string[]) {
    let min: number = 0
    let max: number = nextIds.length;
    let randomIndex: number = Math.floor(Math.random() * (max - min)) + min;

    return nextIds[randomIndex];
  }
}
