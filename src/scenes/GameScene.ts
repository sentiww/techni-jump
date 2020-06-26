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

interface SpikeData {
    spikeTile: Phaser.Tilemaps.Tile;
    spikeEnabled: boolean;
}

enum colorMap {
  red = 0xec1b30,
  orange = 0xf36523,
  yellow = 0xffec01,
  purple = 0xbf245e,
  pink = 0x942977,
  green = 0x8ec63f,
  cyan = 0x00b9f2,
  blue = 0x034da2,
  lime = 0x00a640,
  white = 0xffffff,
  pacific = 0x008fd5,
  kingfisher = 0x662e91,
  amber = 0xffc20f,
  fuego = 0xcadb2a,
  salem = 0x008a4c,
}

const SEGMENT_WIDTH: number = 5;
const TILE_WIDTH: number = 16;
const TILE_HEIGHT: number = 16;
const INITIAL_SPEED: number = 80;
const MAX_SPEED: number = 250;
const SPEED_INC_TIME: number = 1000;
const SPEED_INC_STEP: number = 2;
const SPEED_INC_TIMEFACTOR: number = -0.002;
const SPIKE_IDS: number[] = [581,585,589,593,597,601,605,609,613,617,621,625,629,633,637];
const SPEED_INC_TIME_AFTER_SLOW: number = 200;

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
    private isPlayerDashing: boolean;
    private playerSpeedTimer: Phaser.Time.TimerEvent;
    private playerSpeed: number;
    private laserSpeed: number;
    private laser: Phaser.GameObjects.Sprite;
    private spikeProbability: number;
    private spikes: SpikeData[] = [];
    private beFastAgainTimer: Phaser.Time.TimerEvent = null;
    private playerSlowSpeed: number;
    private scoreSprite: Phaser.GameObjects.Image[] = [];
    private playerCharacter: number;

    public score: number;
    private isDeath: boolean;
    private musicIntro: any;
    private musicLoop: any;
    private muteMusicButton: Phaser.GameObjects.Image;
    private muteSFXButton: Phaser.GameObjects.Image;

    constructor ()
    {
        super('GameScene');
    }

    preload()
    {
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
        this.laserSpeed = INITIAL_SPEED - 30;
        if (this.beFastAgainTimer !== null) this.beFastAgainTimer.destroy();
        this.playerSlowSpeed = null;
        this.score = 0;
        this.isDeath = false;
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
        this.generatePlayer();
        this.player.setDepth(1);
        this.playerSpeedTimer = this.time.addEvent({
            delay: SPEED_INC_TIME,
            callback: () => {
                if (this.playerSpeed < MAX_SPEED) {
                    this.playerSpeed = Math.min(MAX_SPEED, this.playerSpeed + SPEED_INC_STEP);
                }
                let laserMaxSpeed = this.playerSpeed - 10;
                if (this.laserSpeed < laserMaxSpeed) {
                    this.laserSpeed = Math.min(laserMaxSpeed, this.laserSpeed + SPEED_INC_STEP * 2);
                }
                this.playerSpeedTimer.timeScale += SPEED_INC_TIMEFACTOR;
            },
            loop: true
        });
        this.generateMap(true);
        this.laser = this.physics.add.sprite(32, 0, 'laser').setOrigin(1, 0).setDepth(3);
        this.anims.create(
        {
          key: '_laser',
          frames: this.anims.generateFrameNumbers('laser', { start: 0, end: 3 }),
          frameRate: 24,
          repeat: -1
        });
        this.laser.anims.play('_laser');
        (<Phaser.Physics.Arcade.Body>this.laser.body).setAllowGravity(false);
        this.cameras.main.setBounds(0, 0, Number.MAX_VALUE, this.cameras.main.height);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        (<Phaser.Physics.Arcade.Body>this.player.body).setVelocityX(this.playerSpeed);
        this.spikeProbability = 0.10;
        this.sound.stopAll();
        this.time.delayedCall(100, () => {
          this.musicIntro = this.sound.add('music-intro', {loop: false});
          this.musicIntro.play({mute:localStorage.getItem('mutedMusic') === 'false'? false : true});
          this.musicIntro.on('complete', () => {
            this.musicLoop = this.sound.add('music', {loop: true});
            this.musicLoop.play({mute:localStorage.getItem('mutedMusic') === 'false'? false : true});
          })
        });
        this.sound.volume = 0.6;
        this.scoreSprite.push(this.add.sprite(this.game.canvas.width / 2 - 5, this.cameras.main.y + 4, 'numbers', 0),
                              this.add.sprite(this.game.canvas.width / 2, this.cameras.main.y + 4, 'numbers', 0),
                              this.add.sprite(this.game.canvas.width / 2 + 5, this.cameras.main.y + 4, 'numbers', 0));
        this.scoreSprite.forEach(element => {
          element.scrollFactorX = 0;
          element.setDepth(5);
        });
        let helperUp = this.add.image(this.game.canvas.width / 2 - 128, this.game.canvas.height / 2 - 16, 'helper', 0).setOrigin(0.5);
        let helperDown = this.add.image(this.game.canvas.width / 2 - 128, this.game.canvas.height / 2 + 16, 'helper', 1).setOrigin(0.5);

        this.muteMusicButton = this.add.image(this.game.canvas.width - 32, 8, 'muteBtn', (localStorage.getItem('mutedMusic') === 'false' ? 0 : 1)).setInteractive().setScrollFactor(0).setScale(0.8);
        this.muteMusicButton.on('pointerover', () => {
          this.muteMusicButton.setScale(0.7);
        })
        this.muteMusicButton.on('pointerout', () => {
          this.muteMusicButton.setScale(0.8);
        })
        this.muteMusicButton.on('pointerdown', () => {
          if (localStorage.getItem('mutedMusic') === 'true') {
            localStorage.setItem('mutedMusic', 'false');
            if (this.musicLoop) this.musicLoop.setMute(false);
            if (this.musicIntro) this.musicIntro.setMute(false);
            this.muteMusicButton.setFrame(0);
          } else {
            localStorage.setItem('mutedMusic', 'true');
            if (this.musicLoop) this.musicLoop.setMute(true);
            if (this.musicIntro) this.musicIntro.setMute(true);
            this.muteMusicButton.setFrame(1);
          }
        })

        this.muteSFXButton = this.add.image(this.game.canvas.width - 8, 8, 'muteBtn', (localStorage.getItem('mutedSFX') === 'false' ? 2 : 3)).setInteractive().setScrollFactor(0).setScale(0.8);
        this.muteSFXButton.on('pointerover', () => {
          this.muteSFXButton.setScale(0.7);
        })
        this.muteSFXButton.on('pointerout', () => {
          this.muteSFXButton.setScale(0.8);
        })
        this.muteSFXButton.on('pointerdown', () => {
          if (localStorage.getItem('mutedSFX') === 'true') {
            localStorage.setItem('mutedSFX', 'false');
            this.muteSFXButton.setFrame(2);
          } else {
            localStorage.setItem('mutedSFX', 'true');
            this.muteSFXButton.setFrame(3);
          }
        })

        this.add.sprite(helperUp.x + 64, helperUp.y, 'up-to-jump');
        this.add.sprite(helperDown.x + 86, helperDown.y, 'down-to-dash');
    }

  private generatePlayer() {
    this.playerCharacter = 0;
    this.playerCharacter = 5 * Math.round(Math.random() * 15);
    this.player = this.physics.add.sprite(this.game.canvas.width / 4, this.game.canvas.height / 2, 'player', this.playerCharacter);
    this.anims.create(
      {
        key: '_running',
        frames: this.anims.generateFrameNumbers('player', { start: this.playerCharacter, end: this.playerCharacter }),
      });
    this.anims.create(
      {
        key: '_jumping',
        frames: this.anims.generateFrameNumbers('player', { start: this.playerCharacter + 1, end: this.playerCharacter + 1 }),
      });
    this.anims.create(
      {
        key: '_falling',
        frames: this.anims.generateFrameNumbers('player', { start: this.playerCharacter + 2, end: this.playerCharacter + 2 }),
      });
    this.anims.create(
      {
        key: '_laserinframe',
        frames: this.anims.generateFrameNumbers('player', { start: this.playerCharacter + 3, end: this.playerCharacter + 3 }),
      });
    this.anims.create(
      {
        key: '_laserclose',
        frames: this.anims.generateFrameNumbers('player', { start: this.playerCharacter + 4, end: this.playerCharacter + 4 }),
      });
  }

    update()
    {
        this.cleanMap();
        this.generateMap();
        this.platformFall();
        this.playerAnims();

        if (this.playerSlowSpeed === null) {
          (<Phaser.Physics.Arcade.Body>this.player.body)
              .setVelocityX(this.playerSpeed);
        } else {
          (<Phaser.Physics.Arcade.Body>this.player.body)
              .setVelocityX(this.playerSlowSpeed);
        }
        (<Phaser.Physics.Arcade.Body>this.laser.body).setVelocityX(this.laserSpeed);

        const cursors = this.input.keyboard.createCursorKeys();

        if (cursors.up.isDown) {
          this.checkPlayerJump(true);
        } else {
          this.checkPlayerJump(false);
        }
        if (cursors.down.isDown && !(<Phaser.Physics.Arcade.Body>this.player.body).blocked.down && !this.isPlayerDashing) {
          this.isPlayerJumping = false;
          this.isPlayerDashing = true;
          (<Phaser.Physics.Arcade.Body>this.player.body).setVelocityY(500);
          this.sound.play('dash', {mute:localStorage.getItem('mutedSFX') === 'false'? false : true})
        }
        if ((<Phaser.Physics.Arcade.Body>this.player.body).blocked.down) this.isPlayerDashing = false;

        if (((<Phaser.Physics.Arcade.Body>this.player.body).y > 280 ||
            (<Phaser.Physics.Arcade.Body>this.player.body).x + 8 <= this.laser.x) &&
            !this.isDeath) {
          this.isDeath = true;
          this.physics.pause();
          let deathsnd = this.sound.play('death', {mute:localStorage.getItem('mutedSFX') === 'false'? false : true});
          this.sound.get('death').on('complete', () => {
            this.destroyPlayer();
            this.generatePlayer();
            this.scoreSprite.forEach(el => el.destroy());
            this.scoreSprite = [];
            this.scene.start('Menu', {score: this.score});
          });
        }

        this.removeSpikes();
        this.spikeCheck();
        this.score =
            Math.ceil(Math.max(0, (<Phaser.Physics.Arcade.Body>this.player.body).x - 480) / 80);

        this.setScore();
    }

    private setScore()
    {
      if(this.score.toString().split('').length === 1)
      {
        this.scoreSprite[2].setFrame(parseInt(this.score.toString().split('')[0]));
      }
      else if(this.score.toString().split('').length === 2)
      {
        this.scoreSprite[2].setFrame(parseInt(this.score.toString().split('')[1]));
        this.scoreSprite[1].setFrame(parseInt(this.score.toString().split('')[0]));
      }
      else
      {
        this.scoreSprite[2].setFrame(parseInt(this.score.toString().split('')[2]));
        this.scoreSprite[1].setFrame(parseInt(this.score.toString().split('')[1]));
        this.scoreSprite[0].setFrame(parseInt(this.score.toString().split('')[0]));
      }
    }

  private destroyPlayer()
  {
    this.anims.remove('_laserclose');
    this.anims.remove('_laserinframe');
    this.anims.remove('_falling');
    this.anims.remove('_jumping');
    this.anims.remove('_running');
    this.player.removeAllListeners();
    this.player.destroy();
  }

  private playerAnims() {
    if (this.laser.x >= this.player.x - 60 || this.player.y > 225)
      this.player.anims.play('_laserclose');
    else if (this.laser.x >= this.player.x - 240)
      this.player.anims.play('_laserinframe');
    else if ((<Phaser.Physics.Arcade.Body>this.player.body).velocity.y > 0)
      this.player.anims.play('_falling');
    else if ((<Phaser.Physics.Arcade.Body>this.player.body).velocity.y < 0)
      this.player.anims.play('_jumping');
    else
      this.player.anims.play('_running');
  }

  private platformFall() {
    this.map.forEach(mapsegment => {
      let tilemap = mapsegment.tilemap;
      let tilemapLayerGameObj = tilemap.getLayer('layer').tilemapLayer;
      this.physics.collide(this.player, tilemapLayerGameObj);

      if (tilemapLayerGameObj.x - this.player.x < 200 &&
        mapsegment.animationStarted === false) {
        mapsegment.animationStarted = true;
        this.tweens.add({
          targets: tilemapLayerGameObj,
          y: 0,
          ease: 'Quart.easeIn',
          duration: 500 - this.playerSpeed,
          timeScale: 1 + (1 - this.playerSpeedTimer.timeScale),
          onComplete: () => {
            this.cameras.main.shake(100 / this.playerSpeedTimer.timeScale, 0.003);
            this.scoreSprite.forEach(el => el.setScale(1.35));
            this.time.delayedCall(100 / this.playerSpeedTimer.timeScale, () => this.scoreSprite.forEach(el => el.setScale(1)));
            this.sound.play('platform', {mute:localStorage.getItem('mutedSFX') === 'false'? false : true});
          },
        });
        let gradientHint = this.gradients.find(sprite => sprite.x === tilemapLayerGameObj.x);
        if (gradientHint) {
          this.tweens.add({
            targets: gradientHint,
            alpha: 0,
            ease: 'Expo.easeInOut',
            duration: 600,
            delay: 400,
          });
        }
      }
    }
    );
  }

    private checkPlayerJump(isKeyDown: boolean) {
      let yVel: number = (<Phaser.Physics.Arcade.Body>this.player.body).velocity.y;
      let timer: Phaser.Time.TimerEvent;
      if (isKeyDown && !(<Phaser.Physics.Arcade.Body>this.player.body).blocked.up) {
        if ((<Phaser.Physics.Arcade.Body>this.player.body).blocked.down) {
            (<Phaser.Physics.Arcade.Body>this.player.body).setVelocityY(-125);
            this.sound.play('jump', {mute:localStorage.getItem('mutedSFX') === 'false'? false : true});
            this.isPlayerJumping = true;
            timer = this.time.delayedCall(250, () => this.isPlayerJumping = false)
        } else if (this.isPlayerJumping &&
                  !(<Phaser.Physics.Arcade.Body>this.player.body).blocked.up) {
          let newVelocity = yVel - 30 * (200 + yVel) / 200;
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

    private generateMap(isStart = false)
    {
        while (this.map.length < 12) {
            let next = this.originSegments.map(segment => segment.key);
            if (this.map.length > 0)
              next = this.originSegments.find(segment => segment.key === this.lastSegmentKey).next;
            if (isStart && this.map.length < 5)
              next = ['start'];
            const key = next[Math.floor(Math.random() * next.length)];
            const segment = this.make.tilemap({ data: this.originSegments.find(segment => segment.key === key).data, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT });
            if (isStart && this.map.length < 6) {
              segment.forEachTile(tile => {
                if(SPIKE_IDS.includes(tile.index))
                {
                  tile.destroy();
                  tile.index = -1;
                }
              })
              segment.createDynamicLayer('layer', this.originTileset, this.nextSegmentPosition, 0).setDepth(2);
            }
            else {
              this.createSpikes(segment);
              segment.createDynamicLayer('layer', this.originTileset, this.nextSegmentPosition, -280).setDepth(2);
            }
            segment.setCollisionBetween(1, SPIKE_IDS[0] - 1);

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
    private createSpikes(seg: Phaser.Tilemaps.Tilemap)                //Creates spikes from segments
    {
      seg.forEachTile(tile => {
        if(SPIKE_IDS.includes(tile.index))
        {
          if(Math.random() < this.spikeProbability)                   //Creates based on spikeProbability
            this.spikes.push({spikeTile: tile, spikeEnabled: true});
          else                                                        //Else destroys spikes and hides them by index = -1
          {
            tile.destroy();
            tile.index = -1;
          }
        }
      })
    }
    private removeSpikes()                                            //Removes old spikes off-screen
    {
      this.spikes.forEach(spike => {
        if(spike.spikeTile.getRight() < this.player.x - 240)
        {
            spike.spikeTile.destroy();
            this.spikes.shift();
        }
      })
    }
    private spikeCheck()
    {
      this.spikes.forEach(spike => {
        if(spike.spikeTile.y * 16 === Math.round(this.player.y - 8)   //Checking if player is at the spikes Y
          && spike.spikeTile.getLeft() < Math.round(this.player.x)    //Checking if player is between left X of spike and...
          && Math.round(this.player.x) < spike.spikeTile.getRight()   //... between right X of the spike
          && this.playerSpeed > 20                                    //Checking if speed is above 20
          && spike.spikeEnabled)                                      //Checking if the spike hasn't been activated into before
          {
            this.slowPlayer();
            this.sound.play('spikes', {mute:localStorage.getItem('mutedSFX') === 'false'? false : true})
            spike.spikeEnabled = false;                               //Disabling the spike
          }
      })
    }
    private slowPlayer() {
      if (this.playerSlowSpeed !== null) {
        this.playerSlowSpeed = this.playerSpeed / 1.75;
        return;
      }
      this.playerSlowSpeed = this.playerSpeed / 1.75;
      this.beFastAgainTimer = this.time.addEvent({
          delay: SPEED_INC_TIME_AFTER_SLOW,
          callback: () => {
              if (this.playerSlowSpeed < this.playerSpeed) {
                this.playerSlowSpeed = Math.min(this.playerSpeed, this.playerSlowSpeed + SPEED_INC_STEP);
              } else {
                this.playerSlowSpeed = null;
                this.beFastAgainTimer.destroy();
              }
          },
          loop: true
      });
    }
}
