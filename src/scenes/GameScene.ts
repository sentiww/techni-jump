import 'phaser';

interface SegmentData {
    key: string;
    next: any[];
    data: number[][];
}

interface MapSegment {
    tilemap: Phaser.Tilemaps.Tilemap,
    animationStarted: boolean;
}

enum colorMap {
  red = 0xff0000,
  orange = 0xff8000,
  yellow = 0xffff00,
  purple = 0xff0080,
  pink = 0xff00ff,
  green = 0x00ff00,
  cyan = 0x00ffff,
  blue = 0x0000ff,
  lime = 0x00ff80,
  white = 0xffffff,
}

const SEGMENT_WIDTH: number = 5;
const TILE_WIDTH: number = 16;
const TILE_HEIGHT: number = 16;
const INITIAL_SPEED: number = 50;
const MAX_SPEED: number = 220;
const SPEED_INC_TIME: number = 1000;
const SPEED_INC_STEP: number = 1.5;
const SPEED_INC_TIMEFACTOR: number = -0.01;

export default class GameScene extends Phaser.Scene
{
    private originTilemap: Phaser.Tilemaps.Tilemap;
    private originTileset: Phaser.Tilemaps.Tileset;
    private originSegments: SegmentData[];
    private map: MapSegment[];
    private gradients: Phaser.GameObjects.Image[];
    private nextSegmentPosition: number;
    private lastSegmentKey: string;
    private player: Phaser.GameObjects.Sprite;
    private isPlayerJumping: boolean;
    private playerSpeedTimer: Phaser.Time.TimerEvent;
    private playerSpeed: number;

    constructor ()
    {
        super('GameScene');
    }

    preload()
    {
        this.load.spritesheet('tilesetold', 'assets/images/tileset-player.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.spritesheet('tileset', 'assets/images/tileset-extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.tilemapTiledJSON('tilemap', 'assets/tilemaps/tilemap.json');
        this.load.image('gradient', 'assets/images/gradient.png');
        this.cameras.main.setBackgroundColor('#000000');
    }

    init()
    {
        this.originSegments = [];
        this.map = [];
        this.gradients = [];
        this.nextSegmentPosition = 0;
        this.lastSegmentKey = null;
        this.playerSpeed = INITIAL_SPEED;
    }

    create()
    {
        this.originTilemap = this.make.tilemap({ key: 'tilemap' });
        this.originTileset = this.originTilemap.addTilesetImage('tileset', 'tileset', 16, 16, 1, 2);
        this.originSegments = this.originTilemap.layers
            .map(layer => {
                const properties = <{ name: string, value: string }[]>layer.properties;
                return {
                    key: layer.name,
                    next: properties.find((property: { name: string }) => property.name === 'next').value.split(',').map(key => key.trim()),
                    data: layer.data.map(tiles => tiles.map(tile => tile.index)),
                };
            });
        this.player = this.physics.add.sprite(8, 8, 'tilesetold', 1);
        this.player.setDepth(1);
        this.playerSpeedTimer = this.time.addEvent({
            delay: SPEED_INC_TIME,
            callback: () => {
                if (this.playerSpeed < MAX_SPEED) {
                    this.playerSpeed = Math.min(MAX_SPEED, this.playerSpeed + SPEED_INC_STEP);
                    this.playerSpeedTimer.timeScale += SPEED_INC_TIMEFACTOR;
                }
            },
            loop: true
        });
        this.generateMap();
        this.cameras.main.setBounds(0, 0, Number.MAX_VALUE, this.cameras.main.height);
        this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
        this.cameras.main.setRoundPixels(true);
        (<Phaser.Physics.Arcade.Body>this.player.body).setVelocityX(this.playerSpeed);
    }

    update()
    {
        //this.player.x = Math.ceil(this.player.x);
        const cursors = this.input.keyboard.createCursorKeys();
        this.cleanMap();
        this.generateMap();

        this.map.forEach(mapsegment => {
          let tilemap = mapsegment.tilemap
          let tilemapLayerGameObj = tilemap.getLayer('layer').tilemapLayer;
          this.physics.collide(this.player, tilemapLayerGameObj);

          if (tilemapLayerGameObj.x - this.player.x < 200 &&
              mapsegment.animationStarted === false) {
            mapsegment.animationStarted = true;
            this.tweens.add({
              targets: tilemapLayerGameObj,
              y: 0,
              ease: 'Quart.easeIn',
              duration: 500,
              timeScale: 1 + (1 - this.playerSpeedTimer.timeScale),
            });
            let gradientHint = this.gradients.find(sprite => sprite.x === tilemapLayerGameObj.x)
            if (gradientHint) {
              this.tweens.add({
                targets: gradientHint,
                alpha: 0,
                ease: 'Expo.easeInOut',
                duration: 600,
                delay: 400,
              })
            }
          }
        }
        );


        (<Phaser.Physics.Arcade.Body>this.player.body).setVelocityX(this.playerSpeed);


        if (cursors.up.isDown)
          this.checkPlayerJump(true);
        else
          this.checkPlayerJump(false);

        if (cursors.space.isDown) {
            this.scene.pause();
            this.scene.restart();
        }

        console.log((<Phaser.Physics.Arcade.Body>this.player.body).y);
        if ((<Phaser.Physics.Arcade.Body>this.player.body).y > 280){
          this.scene.pause();
          this.scene.restart();
        }
    }

    private checkPlayerJump(isKeyDown: boolean) {
      let yVel: number = (<Phaser.Physics.Arcade.Body>this.player.body).velocity.y;
      let timer: Phaser.Time.TimerEvent;
      if (isKeyDown) {
        if ((<Phaser.Physics.Arcade.Body>this.player.body).blocked.down) {
            (<Phaser.Physics.Arcade.Body>this.player.body).setVelocityY(-15);
            this.isPlayerJumping = true;
            timer = this.time.delayedCall(200, () => this.isPlayerJumping = false)
        } else if (this.isPlayerJumping &&
                  !(<Phaser.Physics.Arcade.Body>this.player.body).blocked.up) {
          let newVelocity = yVel - 20 * (200 + yVel) / 200;
          (<Phaser.Physics.Arcade.Body>this.player.body)
              .setVelocityY(newVelocity);
        } else {
          this.isPlayerJumping = false;
          if(timer) timer.destroy();
        }
      } else {
        this.isPlayerJumping = false;
        if(timer) timer.destroy();
      }
    }

    private generateMap()
    {
        while (this.map.length < 12) {
            let next = this.originSegments.map(segment => segment.key);
            const key = next[Math.floor(Math.random() * next.length)];
            const segment = this.make.tilemap({ data: this.originSegments.find(segment => segment.key === key).data, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT });
            if (this.map.length < 6) {
              segment.createDynamicLayer('layer', this.originTileset, this.nextSegmentPosition, 0);
            } else {
              segment.createDynamicLayer('layer', this.originTileset, this.nextSegmentPosition, -280);
            }
            segment.setCollisionBetween(1, 9999);

            if (this.map.length >= 6) {
              let gradientHint =
                  this.add.image(this.nextSegmentPosition, 0, 'gradient').setOrigin(0, 0);
              gradientHint.depth = -1;
              gradientHint.tint = colorMap[key] ? colorMap[key] : 0xffffff;
              this.gradients.push(gradientHint);
            }
            this.map.push({tilemap:segment, animationStarted: (this.map.length < 6 ? true : false)});
            this.nextSegmentPosition += SEGMENT_WIDTH * TILE_WIDTH;
            this.lastSegmentKey = key;
        }
    }
    private cleanMap()
    {
        for (let i = 0; i < this.map.length; ++i) {
            const segmentEndPosition = this.map[i].tilemap.getLayer('layer').tilemapLayer.x + this.map[i].tilemap.getLayer('layer').widthInPixels;
            const cameraStartPosition = this.player.x - this.cameras.main.width;
            if (segmentEndPosition < cameraStartPosition) {
                this.map[i].tilemap.destroy();
                this.map.splice(i, 1);
            }
        }
        for (let i = 0; i < this.gradients.length; ++i) {
          const gradientEndPosition = this.gradients[i].x + this.gradients[i].width;
          const cameraStartPosition = this.player.x - this.cameras.main.width;
          if (gradientEndPosition < cameraStartPosition) {
              this.gradients[i].destroy();
              this.gradients.splice(i, 1);
          }
        }
    }
}
