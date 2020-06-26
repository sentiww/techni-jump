import 'phaser';

const COLORS = [
  0xec1b30,
  0xf36523,
  0xffec01,
  0xbf245e,
  0x942977,
  0x8ec63f,
  0x00b9f2,
  0x034da2,
  0x00a640,
  0xffffff,
  0x008fd5,
  0x662e91,
  0xffc20f,
  0xcadb2a,
  0x008a4c,
]

export default class Menu extends Phaser.Scene {
  private logo: Phaser.GameObjects.Image;
  private startButton: Phaser.GameObjects.Image;
  private menuTheme: any;
  private score: number = 0;
  private highscore: number;
  private themeBeatCounter: Phaser.Time.TimerEvent;
  private themeBeatColorIndex: number;
  private muteMusicButton: Phaser.GameObjects.Image;
  private muteSFXButton: Phaser.GameObjects.Image;

  constructor ()
  {
      super('Menu');
  }

  init(data) {
    this.score = data.score || -1;
    this.highscore = -1
    this.highscore = Math.max(this.highscore, this.score);
    this.themeBeatColorIndex = 0;
  }

  preload()
  {
      this.load.spritesheet('player', 'assets/images/player.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('helper', 'assets/images/arrow-helper.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('muteBtn', 'assets/images/mute-buttons.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('tileset', 'assets/images/tileset-extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
      this.load.spritesheet('laser', 'assets/images/laser.png', { frameWidth: 480, frameHeight: 270, margin: 0, spacing: 0 });
      this.load.tilemapTiledJSON('tilemap', 'assets/tilemaps/tilemap.json');
      this.load.image('gradient', 'assets/images/gradient.png');
      this.load.image('logo', 'assets/images/techni.png');
      this.load.image('startBtn', 'assets/images/start.png');
      this.load.audio('platform', 'assets/audio/platform.ogg');
      this.load.audio('jump', 'assets/audio/jump.ogg');
      this.load.audio('death', 'assets/audio/ded.ogg');
      this.load.audio('music', 'assets/audio/level-music.ogg');
      this.load.audio('menu-theme', 'assets/audio/menu-theme.ogg');
      this.cameras.main.setBackgroundColor('#000000');
  }

  create() {
    this.logo = this.add.image(this.game.canvas.width / 2, 16, 'logo').setOrigin(0.5, 0);
    this.sound.stopAll();
    this.menuTheme = this.sound.add('menu-theme', {loop: true});
    this.menuTheme.play();
    this.themeBeatCounter = this.time.addEvent({
      delay: 800,
      callback: () => {
        if (++this.themeBeatColorIndex >= COLORS.length)
          this.themeBeatColorIndex = 0;

        this.logo.setTint(COLORS[this.themeBeatColorIndex]);
      },
      loop: true,
    });

    if (this.highscore !== -1) {
      this.add.text(this.game.canvas.width / 2, 48, 'Highscore:').setOrigin(0.5);
      this.add.text(this.game.canvas.width / 2, 64, this.highscore.toString()).setOrigin(0.5);
    }

    if (this.score !== -1) {
      this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, this.score.toString()).setOrigin(0.5);
    }

    this.startButton = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2 + 64, 'startBtn').setOrigin(0.5).setInteractive().setScale(0.8);

    this.startButton.on('pointerover', () => {
      this.startButton.setScale(0.7);
    })
    this.startButton.on('pointerout', () => {
      this.startButton.setScale(0.8);
    })
    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    })

    this.add.image(this.game.canvas.width / 2 - 16, this.game.canvas.height - 8, 'muteBtn', 0);
    this.add.image(this.game.canvas.width / 2 + 16, this.game.canvas.height - 8, 'muteBtn', 2);
  }

  update() {
  }
}
