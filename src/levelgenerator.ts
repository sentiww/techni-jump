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

  public constructor(mainTilemap: Phaser.Tilemaps.Tilemap) {
    this.mainTilemap = mainTilemap;
  }

  /**
   * Generate new Tilemap from layer with given ID.
   *
   * @method LevelGenerator#generateSegment
   *
   * @param {string} segmentId ID of segment to generate.
   *
   * @return {Phaser.Tilemaps.Tilemap} Tilemap containing one layer, which is the segment.
   */
  public generateSegment(segmentId: string): Phaser.Tilemaps.Tilemap{
    /* LayerData from mainTilemap by given Id */
    let segmentTemplate =
        this.mainTilemap.layers.find((layerData: Phaser.Tilemaps.LayerData) => {
          return layerData.name === segmentId;
        })

    /* MapData config for new Tilemap */
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

      /* MapData object for new Tilemap */
      let segmentMapData: Phaser.Tilemaps.MapData =
          new Phaser.Tilemaps.MapData(segmentMapDataConfig);

      /* Additional metadata for our Tilemap such as its ID, IDs of the next compatible segments*/
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
