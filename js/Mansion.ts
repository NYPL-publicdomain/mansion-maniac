///<reference path='Editor.ts' />
///<reference path='typings/tsd.d.ts' />

module Mansion {

  export interface MansionRoomData {
    roomData: RoomData;
    x: number;
    y: number;
    doorsUsed: DoorData;
  }

  export interface AvatarTiles {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }

  export class Mansion {

    stage: createjs.Stage;
    roomURLs: Array<string> = [];
    roomItems: Array<RoomData> = [];
    roomQueue: createjs.LoadQueue;
    mazeRooms: Array<MansionRoomData> = [];
    mazeTiles: Array<Array<string>> = [];
    tileShape: createjs.Shape;
    avatar: createjs.Shape;
    roomContainer: createjs.Container;
    standingRoom: number = 0;
    showDebug: boolean = true;
    lastDebugToggle: number = 0;
    panSpeed: number = 1;
    keyDelay: number = 10;
    canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("easelCanvas");

    constructor() {
      this.stage = new createjs.Stage("easelCanvas");
      createjs.Ticker.on("tick", this.handleTick, this);
      window.onresize = this.handleResize.bind(this);
      this.keyboardController({
        68: () => { this.toggleDebug(); },
        32: () => { this.addRoomToMaze(); },
        37: () => { this.left(); },
        38: () => { this.up(); },
        39: () => { this.right(); },
        40: () => { this.down(); }
      }, this.keyDelay);
      this.handleResize();
    }

    toggleDebug() {
      if (createjs.Ticker.getTime() - this.lastDebugToggle < 500) return;
      this.lastDebugToggle = createjs.Ticker.getTime();
      this.showDebug = !this.showDebug;
      this.refreshDebug();
    }

    refreshDebug() {
      this.tileShape.graphics.clear();
      if (this.showDebug) {
        this.drawRoomTiles();
      }
    }

    mansion() {
      this.roomContainer = new createjs.Container();
      this.stage.addChild(this.roomContainer);

      this.tileShape = new createjs.Shape();
      this.tileShape.alpha = 0.5;
      this.stage.addChild(this.tileShape);

      var x = Math.floor(this.canvas.width * .5);
      var y = Math.floor(this.canvas.height * .5);

      this.stage.x = x;
      this.stage.y = y;

      this.loadRooms();
    }

    startMaze() {
      this.addRoomToMaze();
      // put avatar
      var g = new createjs.Graphics();
      var off = -Config.AVATAR_SIZE;
      g.f("#00ffff")
        .ss(0)
        .r(off + 0, off + 0, Config.AVATAR_SIZE * 2, Config.AVATAR_SIZE * 2)
        .f("#ffffff")
        .r(off + 7, off + 0, 10, 10)
        .r(off + 23, off + 0, 10, 10)
        .f("#000000")
        .r(off + 9, off + 0, 5, 6)
        .r(off + 25, off + 0, 5, 6)
        .ef();
      this.avatar = new createjs.Shape(g);
      var x = 0;
      var y = 0;
      this.avatar.x = x;
      this.avatar.y = y;
      this.stage.addChild(this.avatar);
      var width = this.mazeRooms[0].roomData.tiles[0].length * Config.AVATAR_SIZE;
      var height = this.mazeRooms[0].roomData.tiles.length * Config.AVATAR_SIZE;
      this.panTo(x + (-width * .5), y + (-height * .5));
    }

    right() {
      this.avatar.rotation = 90;
      this.pan(-1, 0);
    }

    left() {
      this.avatar.rotation = -90;
      this.pan(1, 0);
    }

    up() {
      this.avatar.rotation = 0;
      this.pan(0, 1);
    }

    down() {
      this.avatar.rotation = 180;
      this.pan(0, -1);
    }

    pan(x: number, y: number) {
      var currentRoom = this.avatarInRoom();
      if (currentRoom === undefined) return;
      var oldX = this.roomContainer.x;
      var oldY = this.roomContainer.y;
      var newX = oldX + (this.panSpeed * x);
      var newY = oldY + (this.panSpeed * y);
      var tiles = this.avatarInTilesInRoom(newX, newY, currentRoom);
      var collidesWall = this.avatarCollides(tiles, currentRoom.roomData, "w");
      if (collidesWall) {
        newX = oldX;
        newY = oldY;
      }
      var collidesDoor = this.avatarCollides(tiles, currentRoom.roomData, "d");
      if (collidesDoor) {
        console.log("door", this.findCollidingDoor(tiles, currentRoom.roomData));
      }
      this.roomContainer.x = newX;
      this.roomContainer.y = newY;
      this.tileShape.x = this.roomContainer.x;
      this.tileShape.y = this.roomContainer.y;
    }

    panTo(x: number, y: number) {
      this.tileShape.x = this.roomContainer.x = x;
      this.tileShape.y = this.roomContainer.y = y;
    }

    avatarInTilesInRoom(x, y, room: MansionRoomData): AvatarTiles {
      // tells which tiles in the room the avatar is standing on top of
      x = -x;
      y = -y;
      var gs = Config.GRID_SIZE;
      var as = Config.AVATAR_SIZE;
      var roomX = room.x;
      var roomY = room.y;
      var w = room.roomData.tiles[0].length * gs;
      var h = room.roomData.tiles.length * gs;
      var x1 = Math.floor((x - as) / gs);
      var x2 = Math.ceil((x + as) / gs);
      var y1 = Math.floor((y - as) / gs);
      var y2 = Math.ceil((y + as) / gs);
      return { x1: x1, y1: y1, x2: x2, y2: y2 };
    }

    avatarCollides(avatarTiles: AvatarTiles, room: RoomData, type: string): boolean {
      // checks for collision only within the bounds of the avatar
      var x1 = avatarTiles.x1;
      var x2 = avatarTiles.x2;
      var y1 = avatarTiles.y1;
      var y2 = avatarTiles.y2;
      for (var i = y1; i < y2; i++) {
        for (var j = x1; j < x2; j++) {
          if (i >= y1 && i <= y2 && j >= x1 && j <= x2 && room.tiles[i] && room.tiles[i][j] === type) {
            return true;
          }
        }
      }
      return false;
    }

    findCollidingDoor(avatarTiles: AvatarTiles, room: RoomData): Array<number> {
      var x1 = avatarTiles.x1;
      var x2 = avatarTiles.x2;
      var y1 = avatarTiles.y1;
      var y2 = avatarTiles.y2;
      var doors = room.doors;
      var w = room.tiles[0].length;
      var h = room.tiles.length;

      if ((y1 === 0 || y2 === 0) && x1 >= doors.top[0] && x1 <= doors.top[0] + doors.top[1]) {
        return doors.top;
      }

      if ((y1 === h || y2 === h) && x1 >= doors.bottom[0] && x1 <= doors.bottom[0] + doors.bottom[1]) {
        return doors.bottom;
      }

      if ((x1 === 0 || x2 === 0) && y1 >= doors.left[0] && y1 <= doors.left[0] + doors.left[1]) {
        return doors.left;
      }

      if ((x1 === w || x2 === w) && y1 >= doors.right[0] && y1 <= doors.right[0] + doors.right[1]) {
        return doors.right;
      }

      return undefined;
    }

    avatarInRoom(): MansionRoomData {
      return this.roomAtXY(0, 0);
    }

    roomAtXY(x: number, y: number): MansionRoomData {
      for (var roomKey in this.mazeRooms) {
        var room = this.mazeRooms[roomKey];
        var w = room.roomData.tiles[0].length * Config.GRID_SIZE;
        var h = room.roomData.tiles.length * Config.GRID_SIZE;
        if (x >= room.x + this.roomContainer.x && x <= room.x + w + this.roomContainer.x && y >= room.y + this.roomContainer.y && y <= room.y + h + this.roomContainer.y) {
          return room;
        }
      }
      return undefined;
    }

    addRoomToMaze() {
      var x = 0, y = 0;
      var l = this.mazeRooms.length;
      var parentRoom: MansionRoomData;
      var gs = Config.GRID_SIZE;
      if (l > 0) {
        parentRoom = this.mazeRooms[l - 1];
        x = parentRoom.x + (parentRoom.roomData.tiles[0].length * gs);
        // y = parentRoom.y + (parentRoom.roomData.tiles.length * gs);
      }
      var roomIndex = this.chooseRandomRoom();
      var roomURL = this.roomURLs[roomIndex];
      var room = new createjs.Bitmap(roomURL);
      room.x = x;
      room.y = y;
      var roomData = this.roomItems[roomIndex];
      var scaleX = (Math.round(room.getBounds().width / gs) * gs) / room.getBounds().width;
      var scaleY = (Math.round(room.getBounds().height / gs) * gs) / room.getBounds().height;
      room.scaleX = scaleX;
      room.scaleY = scaleY;
      this.roomContainer.addChild(room);
      this.mazeRooms.push({ roomData: roomData, x: x, y: y, doorsUsed: { top: [], right: [], bottom: [], left: [] } });
      this.refreshDebug();
      this.stage.update();
    }

    drawRoomTiles() {
      var i;
      var g = new createjs.Graphics();
      g.setStrokeStyle(0);
      for (i = 0; i < this.mazeRooms.length; i++) {
        var room = this.mazeRooms[i];
        this.drawTiles(g, room);
      }
      g.ef();
      this.tileShape.graphics = g;
    }

    drawTiles(g, room: MansionRoomData) {
      var i, j;
      var roomData = room.roomData;
      var tiles = roomData.tiles;
      var color: string;
      var gs = Config.GRID_SIZE;
      for (i = 0; i < tiles.length; i++) {
        if (tiles[i] === undefined || tiles[i] === null) continue;
        for (j = 0; j < tiles[i].length; j++) {
          switch (tiles[i][j]) {
            case "f":
              color = Config.FLOOR_COLOR;
              break;
            case "d":
              color = Config.DOOR_COLOR;
              break;
            case "w":
              color = Config.WALL_COLOR;
              break;
            default:
              color = "";
              break;
          }
          if (color !== "") g.f(color).r(room.x + (j * gs), room.y + (i * gs), gs, gs);
        }
      }
    }

    chooseRandomRoom() {
      var index: number;
      var count = 0;
      while (count < 10) {
        count++;
        index = Math.floor(Math.random() * this.roomItems.length);
        var room = this.roomItems[index];
        if (room.tiles && room.tiles.length > 0 && room.doors && (room.doors.bottom !== undefined || room.doors.top !== undefined || room.doors.right !== undefined || room.doors.left !== undefined)) {
          // room has tiles and a door
          return index;
        }
      }
      return index;
    }

    loadRooms() {
      this.roomQueue = new createjs.LoadQueue(false);
      this.roomQueue.on("fileload", this.handleLoadRoom, this);
      this.roomQueue.on("complete", this.handleLoadComplete, this);
      this.roomQueue.loadManifest("js/rooms.json");
    }

    handleLoadRoom(event) {
      if (event.item.type == "manifest") return;
      var room = event.item.src;
      this.roomURLs.push(room);
      var data: RoomData = {
        id: event.item.id,
        src: event.item.src.replace(event.item.path, ""),
        root: event.item.root,
        tiles: event.item.tiles,
        doors: event.item.doors
      };
      this.roomItems.push(data);
      console.log(event.item.src);
    }

    handleLoadComplete(event) {
      console.log("complete!");
      this.startMaze();
    }

    handleResize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    keyboardController(keys, repeat) {
      // Lookup of key codes to timer ID, or null for no repeat
      //
      var timers = {};

      // When key is pressed and we don't already think it's pressed, call the
      // key action callback and set a timer to generate another one after a delay
      //
      document.onkeydown = function(event) {
        var key = (<KeyboardEvent>(event || window.event)).keyCode;
        if (!(key in keys))
          return true;
        if (!(key in timers)) {
          timers[key] = null;
          keys[key]();
          if (repeat !== 0)
            timers[key] = setInterval(keys[key], repeat);
        }
        return false;
      };

      // Cancel timeout and mark key as released on keyup
      //
      document.onkeyup = function(event) {
        var key = (<KeyboardEvent>(event || window.event)).keyCode;
        if (key in timers) {
          if (timers[key] !== null)
            clearInterval(timers[key]);
          delete timers[key];
        }
      };

      // When window is unfocused we may not get key events. To prevent this
      // causing a key to 'get stuck down', cancel all held keys
      //
      window.onblur = function() {
        for (var key in timers)
          if (timers[key] !== null)
            clearInterval(timers[key]);
        timers = {};
      };
    };

    handleTick(event) {
      // console.log("tick!");
      this.stage.update();
      if (!event.paused) {
        //
      }
    }

  }
}