declare module "open-location-code" {
  export class OpenLocationCode {
    encode(lat: number, lng: number, length?: number): string;
    decode(code: string): { latitudeCenter: number; longitudeCenter: number };
    isFull(code: string): boolean;
    isShort(code: string): boolean;
    recoverNearest(code: string, lat: number, lng: number): string;
    shorten(code: string, lat: number, lng: number): string;
  }
}
