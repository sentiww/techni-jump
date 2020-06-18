/**
 * @classdesc
 * Level generator class which deals with infinite generation
 * of map from one Tilemap with multiple layers.
 *
 * @class LevelGenerator
 * @constructor
 *
 * @param {Phaser.Tilemaps.Tilemap} mainTilemap created Tilemap object with
 * layers corresponding to segments.
 */
export default class LevelGenerator {
  /**
   * Main tilemap object with multiple layers.
   *
   * @name LevelGenerator#mainTilemap
   * @type {Phaser.Tilemaps.Tilemap}
   */
  private mainTilemap: Phaser.Tilemaps.Tilemap;

  /**
   * Array of Tilemaps, which will be copied to
   * generate level sequence.
   *
   * @name LevelGenerator#segmentsTemplates
   * @type {Phaser.Tilemaps.Tilemap[]}
   */
  public segmentsTemplates: Phaser.Tilemaps.Tilemap[];

  public constructor(mainTilemap: Phaser.Tilemaps.Tilemap) {
    this.mainTilemap = mainTilemap;

    /* Converting all layers from original map to different tilemaps */
  }

  public generateSegment(segmentId: string): Phaser.Tilemaps.Tilemap{
    let segmentTemplate =
        this.mainTilemap.layers.find((layerData: Phaser.Tilemaps.LayerData) => {
          return layerData.name === segmentId;
        })

    let segmentMapDataConfig: Phaser.Types.Tilemaps.MapDataConfig = {
        //name: segmentTemplate.name,
        width: segmentTemplate.width,
        height: segmentTemplate.height,
        tileWidth: segmentTemplate.tileWidth,
        tileHeight: segmentTemplate.tileHeight,
        widthInPixels: segmentTemplate.widthInPixels,
        heightInPixels: segmentTemplate.heightInPixels,
        format: this.mainTilemap.format,
        orientation: this.mainTilemap.orientation,
        renderOrder: this.mainTilemap.renderOrder,
        version: this.mainTilemap.version,
        layers: [segmentTemplate],
        tilesets: this.mainTilemap.tilesets,
      }

      let segmentMapData: Phaser.Tilemaps.MapData =
          new Phaser.Tilemaps.MapData(segmentMapDataConfig);

      let segmentTilemap: any =
          new Phaser.Tilemaps.Tilemap(this.mainTilemap.scene, segmentMapData);
      segmentTilemap.nextSegments =
          segmentTemplate.properties.find((property: {name: string}) => {
            return property.name.toLowerCase() === 'connections';
          })['value'].split(',');
      segmentTilemap.currentSegment = segmentTemplate.name;

      return segmentTilemap;
  }
}
