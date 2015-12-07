///<reference path='typings/tsd.d.ts' />

module Mansion {

  export class Config {
    public static WALL_COLOR: string = "#ff0000";
    public static FLOOR_COLOR: string = "#ffffff";
    public static DOOR_COLOR: string = "#00ffff";
    public static DELETE_COLOR: string = "#000000";
    public static GRID_SIZE: number = 20;
    public static AVATAR_SIZE: number = 18;
  }

  export interface DoorData {
    top: Array<number>;
    right: Array<number>;
    bottom: Array<number>;
    left: Array<number>;
  }

  export interface RoomData {
    id: string;
    src: string;
    url: any;
    root: number;
    tiles: Array<Array<string>>;
    doors: DoorData;
  }

  export interface MansionRoomData {
    roomData: RoomData;
    x: number;
    y: number;
    doorsUsed: DoorData;
  }

  export interface CollidingDoorData {
    data: Array<number>;
    position: string;
  }

  export interface AvatarTiles {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }

  export interface MansionRoomData {
    roomData: RoomData;
    x: number;
    y: number;
    doorsUsed: DoorData;
  }

  export interface CollidingDoorData {
    data: Array<number>;
    position: string;
  }

  export interface AvatarTiles {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }

}