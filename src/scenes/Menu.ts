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
  private themeBeatColorIndex: number;
  private muteMusicButton: Phaser.GameObjects.Image;
  private muteSFXButton: Phaser.GameObjects.Image;

  constructor ()
  {
      super('Menu');
  }

  init(data) {
    this.score = data.score || -1;
    this.highscore = Number.parseInt(localStorage.getItem('highscore')) || -1;
    this.highscore = Math.max(this.highscore, this.score);
    if (this.highscore !== -1) localStorage.setItem('highscore', this.highscore.toString());
    this.themeBeatColorIndex = 0;

    if (localStorage.getItem('mutedMusic') === null) localStorage.setItem('mutedMusic', 'false');
    if (localStorage.getItem('mutedSFX') === null) localStorage.setItem('mutedSFX', 'false');
  }

  preload()
  {
      this.load.spritesheet('player', 'assets/images/player.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('helper', 'assets/images/arrow-helper.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('muteBtn', 'assets/images/mute-buttons.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('tileset', 'assets/images/tileset-extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
      this.load.spritesheet('laser', 'assets/images/laser.png', { frameWidth: 480, frameHeight: 270, margin: 0, spacing: 0 });
      this.load.tilemapTiledJSON('tilemap', 'assets/tilemaps/tilemap.json');
      this.load.spritesheet('numbers', 'assets/images/nums.png', { frameWidth: 5, frameHeight: 7, margin: 0, spacing: 0 });
      this.load.tilemapTiledJSON('tilemap', 'assets/tilemaps/tilemap.json');
      this.load.image('gradient', 'assets/images/gradient.png');
      this.load.image('logo', 'assets/images/techni.png');
      this.load.image('startBtn', 'assets/images/start.png');
      this.load.image('up-to-jump', 'assets/images/up-to-jump.png');
      this.load.image('down-to-dash', 'assets/images/down-to-dash.png');
      this.load.image('highscore', 'assets/images/highscore.png');
      this.load.audio('platform', 'assets/audio/platform.ogg');
      this.load.audio('jump', 'assets/audio/jump.ogg');
      this.load.audio('dash', 'assets/audio/dash.ogg');
      this.load.audio('spikes', 'assets/audio/spike.ogg');
      this.load.audio('death', 'assets/audio/ded.ogg');
      this.load.audio('music', 'assets/audio/theme.ogg');
      this.load.audio('music-intro', 'assets/audio/theme-intro.ogg');
      this.load.audio('menu-theme', 'assets/audio/menu-theme.ogg');
      this.cameras.main.setBackgroundColor('#000000');
  }

  create() {
    this.logo = this.add.image(this.game.canvas.width / 2, 16, 'logo').setOrigin(0.5, 0);
    this.time.addEvent({
      delay: 800,
      callback: () => {
        if (++this.themeBeatColorIndex >= COLORS.length)
          this.themeBeatColorIndex = 0;

        this.logo.setTint(COLORS[this.themeBeatColorIndex]);
      },
      loop: true,
    });
    this.sound.stopAll();
    this.menuTheme = this.sound.add('menu-theme', {loop: true});
    this.menuTheme.play({mute: localStorage.getItem('mutedMusic') === 'true' ? true : false});
    this.sound.volume = 0.6;

    if (this.highscore !== -1) {
      this.add.sprite(this.game.canvas.width / 2, 48, 'highscore').setOrigin(0.5);
      this.highscore.toString().split('').forEach((number, index) => {
        this.add.sprite(this.game.canvas.width / 2 + 5 * index, 64, 'numbers', parseInt(number));
      })
    }

    if (this.score !== -1) {
      this.score.toString().split('').forEach((number, index) => {
        this.add.sprite(this.game.canvas.width / 2 + 5 * index, this.game.canvas.height / 2, 'numbers', parseInt(number));
      })
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

    this.muteMusicButton = this.add.image(this.game.canvas.width / 2 - 16, this.game.canvas.height - 8, 'muteBtn', (localStorage.getItem('mutedMusic') === 'false' ? 0 : 1)).setInteractive();
    this.muteMusicButton.on('pointerover', () => {
      this.muteMusicButton.setScale(0.9);
    })
    this.muteMusicButton.on('pointerout', () => {
      this.muteMusicButton.setScale(1);
    })
    this.muteMusicButton.on('pointerdown', () => {
      if (localStorage.getItem('mutedMusic') === 'true') {
        localStorage.setItem('mutedMusic', 'false');
        this.menuTheme.setMute(false);
        this.muteMusicButton.setFrame(0);
      } else {
        localStorage.setItem('mutedMusic', 'true');
        this.menuTheme.setMute(true);
        this.muteMusicButton.setFrame(1);
      }
    })

    this.muteSFXButton = this.add.image(this.game.canvas.width / 2 + 16, this.game.canvas.height - 8, 'muteBtn', (localStorage.getItem('mutedSFX') === 'false' ? 2 : 3)).setInteractive();
    this.muteSFXButton.on('pointerover', () => {
      this.muteSFXButton.setScale(0.9);
    })
    this.muteSFXButton.on('pointerout', () => {
      this.muteSFXButton.setScale(1);
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
  }

  update() {
  }
}
