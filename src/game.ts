import 'phaser';
import GameScene from './scenes/GameScene'
import Menu from './scenes/Menu'
import Stats from 'stats-js/src/Stats'

let game: Phaser.Game;

class Game extends Phaser.Game
{
    public ENV: string;
    public skipSplashState: boolean;
    public skipMenuState: boolean;

    constructor(gameConfig: Phaser.Types.Core.GameConfig)
    {
        super(gameConfig);
        this.ENV = '__buildEnv__';
        this.skipSplashState = false;
        this.skipMenuState = false;
        if (this.ENV !== 'production') {
            this.setupStatsJS();
        }
        this.scene.add('Menu', Menu, true);
        this.scene.add('GameState', GameScene, false);
    }
    private setupStatsJS()
    {
        const stats = Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        this.events.on(Phaser.Core.Events.PRE_STEP, () => {
            stats.begin();
        });
        this.events.on(Phaser.Core.Events.POST_RENDER, () => {
            stats.end();
        });
    }
}

const resize = () => {
    const zoomX = Math.floor(window.innerWidth / game.scale.width);
    const zoomY = Math.floor(window.innerHeight / game.scale.height);
    const zoom = Math.min(zoomX, zoomY);
    game.scale.setZoom(zoom);
}

window.onload = () => {
    game = new Game({
        type: Phaser.AUTO,
        width: 480,
        height: 270,
        render: {
            pixelArt: true
        },
        scale: {
            autoRound: true,
            mode: Phaser.Scale.ScaleModes.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 400 },
            }
        },
    });
    resize();
    window.addEventListener('resize', resize, false);
}
