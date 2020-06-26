import 'phaser';

export default class Menu extends Phaser.Scene {
  private startButton: Phaser.GameObjects.Rectangle;
  private score: number = 0;
  private highscore: number;

  constructor ()
  {
      super('Menu');
  }

  init(data) {
    this.score = data.score || -1;
    this.highscore = -1
    this.highscore = Math.max(this.highscore, this.score);
  }

  preload()
  {
      this.load.spritesheet('player', 'assets/images/player.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 0 });
      this.load.spritesheet('tileset', 'assets/images/tileset-extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
      this.load.spritesheet('laser', 'assets/images/laser.png', { frameWidth: 480, frameHeight: 270, margin: 0, spacing: 0 });
      this.load.tilemapTiledJSON('tilemap', 'assets/tilemaps/tilemap.json');
      this.load.image('gradient', 'assets/images/gradient.png');
      this.load.audio('platform', 'assets/audio/platform.ogg');
      this.load.audio('jump', 'assets/audio/jump.ogg');
      this.load.audio('death', 'assets/audio/ded.ogg');
      this.load.audio('music', 'assets/audio/level-music.ogg');
      this.cameras.main.setBackgroundColor('#000000');
  }

  create() {
    this.add.text(this.game.canvas.width / 2, 16, 'Techni Jump').setOrigin(0.5);

    if (this.highscore !== -1) {
      this.add.text(this.game.canvas.width / 2, 48, 'Highscore:').setOrigin(0.5);
      this.add.text(this.game.canvas.width / 2, 64, this.highscore.toString()).setOrigin(0.5);
    }

    if (this.score !== -1) {
      this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, this.score.toString()).setOrigin(0.5);
    }

    this.startButton = this.add.rectangle(this.game.canvas.width / 2, this.game.canvas.height / 2, 100, 30, 0xffffff, 1).setOrigin(0.5).setInteractive();
    let txt = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'Start', {color: '#000'}).setOrigin(0.5);
    this.sound.stopAll();

    this.startButton.on('pointerover', () => {
      this.startButton.setScale(0.9);
    })
    this.startButton.on('pointerout', () => {
      this.startButton.setScale(1);
    })
    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    })
  }

  update() {
  }
}
