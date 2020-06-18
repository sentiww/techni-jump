import 'phaser';


import Level from './scenes/sceneLevel';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 480,
    height: 270,
    pixelart:true,
    zoom:3,
    scene: Level
};

const game = new Phaser.Game(config);
