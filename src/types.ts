declare global {
  interface Window { AMap: any; }
}

// Map
export type IMap = any;

// Basic
export interface IPixel {
  getX(): number;
  getY(): number;
  equals(point: IPixel): boolean;
  toString(): string;
}

export interface ISize {
  getWidth(): number;
  getHeight(): number;
  toString(): string;
}

export interface ILngLat {
  offset(): ILngLat;
  distance(lnglat: ILngLat | ILngLat[]): number;
  getLng(): number;
  getLat(): number;
  equals(lnglat: ILngLat): boolean;
  toString(): string;
}

export interface IBounds {
  contains(point: ILngLat): boolean;
  getCenter(): ILngLat;
  getSouthWest(): ILngLat;
  getNorthEast(): ILngLat;
  toString(): string;
}

// Event
export interface IMapsEvent {
  lnglat: ILngLat;
  pixel: IPixel;
  type: string;
  target: object;
}

export type IMouseCallback = (map: IMap, event?: IMapsEvent) => void;
export type IOrdinaryCallback = (map: IMap) => void;