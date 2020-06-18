import LevelGenerator from '../levelgenerator';

export default class Level extends Phaser.Scene
{
  private levelGenerator: LevelGenerator;

  private tileset: any;

  private segmentsList: {
    displayed: boolean,
    toDestroy: boolean,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.StaticTilemapLayer
  }[] = [];

  private lastSegmentData: {
    id: string,
    nextIds: string[],
  } = {id: null, nextIds: []};

  private lastDisplayedSegmentX: number = 0;

  private player: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private maxBounds: number = 480;
  private xBounds: number = 0;

  constructor () {
    super('level');
  }

  preload () {
    this.load.tilemapTiledJSON('mapSegments', 'assets/mapSegments.json');
    this.load.image('tileset', 'assets/tileset.png');
    this.load.spritesheet('hero',
	    'assets/hero.png',
      { frameWidth: 16, frameHeight: 16 }
    );
  }

  create() {
    let map: Phaser.Tilemaps.Tilemap =
        this.make.tilemap({key: 'mapSegments'});

    this.levelGenerator = new LevelGenerator(map);
    this.tileset = map.addTilesetImage(map.tilesets[0].name, 'tileset');

    /* Initial segment */
    this.insertSegment('A');


    this.player = this.physics.add.sprite(0, 130, 'hero');
    this.player.setBounce(0.2);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(this.xBounds, 0, this.maxBounds, 270);
    this.physics.world.setBounds(this.xBounds, 0, this.maxBounds, 270);
    this.cameras.main.startFollow(this.player, true);
    this.player.setVelocityX(160);
  }

  update() {
    this.cameras.main.setBounds(this.xBounds, 0, this.maxBounds, 270);
    this.physics.world.setBounds(this.xBounds, 0, this.maxBounds, 270);

    /* Displaying segments form list, which are not displayed */
    this.segmentsList.filter(segment => segment.displayed === false)
        .forEach(segment => {
          segment.layer = segment.tilemap.createStaticLayer(0, this.tileset, this.lastDisplayedSegmentX, 0);
          this.lastDisplayedSegmentX += segment.tilemap.widthInPixels;
          segment.displayed = true;
          console.log(this.segmentsList, this.lastDisplayedSegmentX)
        })
    
    if(this.player.x + 480 >= this.lastDisplayedSegmentX)
    {
      this.insertSegment(this.randomNextSegmentId(this.lastSegmentData.nextIds));
      this.maxBounds += 80;
    }
      
      
    if(this.player.x - 480 >= this.segmentsList[0].layer.x)
      {
        this.segmentsList[0].layer.destroy();
        this.segmentsList[0].tilemap.destroy();
        this.segmentsList.shift();
        this.xBounds += 80;
      }

    //this.player.setVelocity(0, 0);
    if(this.cursors.left.isDown)
      this.player.setVelocityX(-160);
    if(this.cursors.right.isDown)
      this.player.setVelocityX(160);
    if(this.cursors.down.isDown)
      this.player.setVelocityY(330);
    if(this.cursors.up.isDown)
      this.player.setVelocityY(-330);
  }

  /* Generates new Tilemap and inserts it to list of segments building the level */
  private insertSegment(segmentId: string): void {
    let segmentTilemap: any = this.levelGenerator.generateSegment(segmentId);

    this.segmentsList.push({
      displayed: false,
      toDestroy: false,
      tilemap: segmentTilemap,
      layer: null
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
