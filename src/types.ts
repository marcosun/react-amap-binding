export interface IAMap {
  readonly Lights: Lights;
  readonly Object3DLayer: Object3DLayer;
  readonly Object3D: Object3D;
}

interface Object3D {
  readonly Mesh: Mesh;
}

interface Lights {
  readonly AmbientLight: AmbientLight;
  readonly DirectionLight: DirectionLight;
}

interface AmbientLight {

}

interface DirectionLight {

}

interface Pixel {
  x: number;
  y: number;
}

type LngLat = [number, number] | {

};

interface MapOptions {
  viewMode?: "3D" | "2D";
  pitch?: number;
  maxPitch?: number;
  rotation?: number;
}

type Vertex = [number, number, number];

interface Pickup {
  object: Mesh; // 被拾取到的Object3D对象
  index: number; // 射线穿透的三角形面在当前mesh所有面上的索引
  point: Vertex; // 被拾取到的对象和拾取射线的交叉点的3D坐标
  distance: number; // 交叉点距透视原点的距离
}

type Overlayer = Object3DLayer;

export interface Map {

  AmbientLight: AmbientLight;
  DirectionLight: DirectionLight;
  new(options: MapOptions): Map;

  add(layer: Overlayer): void;
  remove(layer: Overlayer): void;
  lngLatToGeodeticCoord(lng: LngLat): Pixel;
  geodeticCoordToLngLat(pixel: Pixel): LngLat;

  getObject3DByContainerPos(pixel: Pixel, layers: Object3DLayer[], all?: boolean): Pickup;
}

interface Object3DLayerOptions {
  map?: Map;
  zIndex?: number;
  opacity?: number;
}

export interface Object3DLayer {

  objects: Object3DType[];
  new(opts?: Object3DLayerOptions): Object3DLayer;

  clear(): void;
  add(mesh: Object3DType): void;
  remove(mesh: Object3DType): void;
  reDraw(): void;
}

type Object3DType = Mesh;
type TextureIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface MeshGeometry {
  readonly vertices: number[];
  readonly vertexColors: number[];
  readonly faces: number[];
  readonly vertexUVs: number[];
  readonly textureIndices: TextureIndex[];

  reDraw(): void;
}

type Texture = string;

export interface Mesh {

  readonly geometry: MeshGeometry;
  textures: Texture[];
  needUpdate: boolean;
  transparent: boolean;
  DEPTH_TEST: boolean;
  new(): Mesh;
  reDraw(): void;
}
