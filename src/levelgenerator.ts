export default class LevelGenerator {
  private mainTilemap: Phaser.Tilemaps.Tilemap;
  public segmentsTilemaps: Phaser.Tilemaps.Tilemap[];

  public constructor(mainTilemap: Phaser.Tilemaps.Tilemap) {
    this.mainTilemap = mainTilemap;

    /* Converting all layers from original map to different tilemaps */
    this.segmentsTilemaps =
        this.mainTilemap.layers.map((el: Phaser.Tilemaps.LayerData) => {
          let segmentMapConfig: Phaser.Types.Tilemaps.MapDataConfig = {
            name: el.name,
            width: el.width,
            height: el.height,
            tileWidth: el.tileWidth,
            tileHeight: el.tileHeight,
            widthInPixels: el.widthInPixels,
            heightInPixels: el.heightInPixels,
            format: this.mainTilemap.format,
            orientation: this.mainTilemap.orientation,
            renderOrder: this.mainTilemap.renderOrder,
            version: this.mainTilemap.version,
            layers: [el],
            tilesets: this.mainTilemap.tilesets,
          }


          let mapData: Phaser.Tilemaps.MapData =
              new Phaser.Tilemaps.MapData(segmentMapConfig);
          return new Phaser.Tilemaps.Tilemap(this.mainTilemap.scene, mapData);
        })
    console.log(this.segmentsTilemaps);
  }

  private randomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
