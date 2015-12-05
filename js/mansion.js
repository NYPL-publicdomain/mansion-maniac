///<reference path='typings/tsd.d.ts' />
var Mansion;
(function (Mansion) {
    var Config = (function () {
        function Config() {
        }
        Config.WALL_COLOR = "#ff0000";
        Config.FLOOR_COLOR = "#ffffff";
        Config.DOOR_COLOR = "#00ffff";
        Config.DELETE_COLOR = "#000000";
        Config.GRID_SIZE = 20;
        Config.AVATAR_SIZE = 18;
        return Config;
    })();
    Mansion.Config = Config;
    var Editor = (function () {
        function Editor() {
            this.roomBitmaps = [];
            this.roomItems = [];
            this.currentRoom = -1;
            this.canvasWidth = 1024;
            this.canvasHeight = 800;
            this.roomX = 200;
            this.roomY = 160;
            this.tileType = "floor";
            this.isDrawing = false;
            this.outputBoxElement = document.getElementById("output");
            this.saveButtonElement = document.getElementById("save");
            this.saveButtonElement.onclick = this.handleSaveClick.bind(this);
            this.stage = new createjs.Stage("easelCanvas");
            this.stage.enableMouseOver(10);
            document.onkeydown = this.handleKeyDown.bind(this);
            // createjs.Ticker.on("tick", this.handleTick, this);
        }
        Editor.prototype.init = function () {
            this.initRoom();
            this.drawGrid();
            this.drawUI();
            this.initTiles();
            this.loadRooms();
            this.initCursor();
        };
        Editor.prototype.initCursor = function () {
            this.mouseCursor = new createjs.Shape();
            this.mouseCursor.x = -100;
            this.stage.addChild(this.mouseCursor);
            this.stage.on("stagemousemove", this.handleStageMouseMove, this);
            this.updateCursor(this.tileType);
        };
        Editor.prototype.initTiles = function () {
            this.tileShape = new createjs.Shape();
            this.tileShape.x = this.roomX;
            this.tileShape.y = this.roomY;
            this.tileShape.alpha = 0.5;
            this.stage.addChild(this.tileShape);
        };
        Editor.prototype.initRoom = function () {
            this.roomContainer = new createjs.Container();
            this.stage.addChild(this.roomContainer);
            this.roomContainer.on("mousedown", this.handleRoomMouseDown, this);
            this.roomContainer.on("click", this.handleRoomMouseDown, this);
            this.roomContainer.on("pressmove", this.handleRoomMouseMove, this);
            this.roomContainer.on("pressup", this.handleRoomMouseUp, this);
        };
        Editor.prototype.clearTiles = function () {
            this.roomItems[this.currentRoom].tiles = [];
            this.drawTiles();
            this.updateRoomOutput();
        };
        Editor.prototype.drawTile = function (x, y) {
            var tiles = this.roomItems[this.currentRoom].tiles;
            if (this.tileType === "delete") {
                if (tiles[y] !== undefined && tiles[y] !== null) {
                    delete tiles[y][x];
                    if (x === tiles[y].length - 1)
                        tiles[y].pop();
                }
            }
            else {
                if (tiles[y] === undefined || tiles[y] === null) {
                    tiles[y] = [];
                }
                tiles[y][x] = this.tileType.substr(0, 1);
            }
            this.drawTiles();
        };
        Editor.prototype.drawTiles = function () {
            this.tileShape.graphics.clear();
            var g = new createjs.Graphics();
            g.setStrokeStyle(0);
            var i, j;
            var tiles = this.roomItems[this.currentRoom].tiles;
            var color;
            var gs = Config.GRID_SIZE;
            for (i = 0; i < tiles.length; i++) {
                if (tiles[i] === undefined || tiles[i] === null)
                    continue;
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
                    if (color !== "")
                        g.f(color).r((j * gs), (i * gs), gs, gs);
                }
            }
            g.ef();
            this.tileShape.graphics = g;
            this.stage.update();
        };
        Editor.prototype.updateCursor = function (type) {
            this.tileType = type;
            var color;
            switch (this.tileType) {
                case "floor":
                    color = Config.FLOOR_COLOR;
                    break;
                case "door":
                    color = Config.DOOR_COLOR;
                    break;
                case "wall":
                    color = Config.WALL_COLOR;
                    break;
                case "delete":
                    color = Config.DELETE_COLOR;
                    break;
            }
            this.mouseCursor.graphics.c().f(color).r(0, 0, Config.GRID_SIZE * .5, Config.GRID_SIZE * .5);
            this.stage.update();
        };
        Editor.prototype.drawUI = function () {
            var g, text;
            g = new createjs.Graphics();
            g.f(Config.WALL_COLOR).r(0, 0, Config.GRID_SIZE * 6, Config.GRID_SIZE);
            var wallButton = new createjs.Shape(g);
            wallButton.name = "wall";
            wallButton.cursor = "pointer";
            wallButton.x = Config.GRID_SIZE;
            wallButton.y = Config.GRID_SIZE;
            this.stage.addChild(wallButton);
            wallButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Wall", "16px Arial", Config.DELETE_COLOR);
            text.x = Config.GRID_SIZE * 3;
            text.y = Config.GRID_SIZE + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Config.FLOOR_COLOR).r(0, 0, Config.GRID_SIZE * 6, Config.GRID_SIZE);
            var floorButton = new createjs.Shape(g);
            floorButton.name = "floor";
            floorButton.cursor = "pointer";
            floorButton.x = Config.GRID_SIZE;
            floorButton.y = Config.GRID_SIZE * 2;
            this.stage.addChild(floorButton);
            floorButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Floor", "16px Arial", Config.DELETE_COLOR);
            text.x = Config.GRID_SIZE * 3;
            text.y = Config.GRID_SIZE * 2 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Config.DOOR_COLOR).r(0, 0, Config.GRID_SIZE * 6, Config.GRID_SIZE);
            var doorButton = new createjs.Shape(g);
            doorButton.name = "door";
            doorButton.cursor = "pointer";
            doorButton.x = Config.GRID_SIZE;
            doorButton.y = Config.GRID_SIZE * 3;
            this.stage.addChild(doorButton);
            doorButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Door", "16px Arial", Config.DELETE_COLOR);
            text.x = Config.GRID_SIZE * 3;
            text.y = Config.GRID_SIZE * 3 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Config.DELETE_COLOR).r(0, 0, Config.GRID_SIZE * 6, Config.GRID_SIZE);
            var deleteButton = new createjs.Shape(g);
            deleteButton.name = "delete";
            deleteButton.cursor = "pointer";
            deleteButton.x = Config.GRID_SIZE;
            deleteButton.y = Config.GRID_SIZE * 4;
            this.stage.addChild(deleteButton);
            deleteButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Delete", "16px Arial", Config.FLOOR_COLOR);
            text.x = Config.GRID_SIZE * 3;
            text.y = Config.GRID_SIZE * 4 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Config.DELETE_COLOR).r(0, 0, Config.GRID_SIZE * 6, Config.GRID_SIZE);
            var clearButton = new createjs.Shape(g);
            clearButton.name = "clear";
            clearButton.cursor = "pointer";
            clearButton.x = Config.GRID_SIZE;
            clearButton.y = Config.GRID_SIZE * 6;
            this.stage.addChild(clearButton);
            clearButton.on("click", this.clearTiles, this);
            text = new createjs.Text("Clear", "16px Arial", Config.FLOOR_COLOR);
            text.x = Config.GRID_SIZE * 3;
            text.y = Config.GRID_SIZE * 6 + 2;
            this.stage.addChild(text);
            this.roomText = new createjs.Text("", "16px Arial", "#ffffff");
            this.roomText.x = Config.GRID_SIZE;
            this.roomText.y = this.roomY + Config.GRID_SIZE;
            this.stage.addChild(this.roomText);
            this.stage.update();
        };
        Editor.prototype.drawGrid = function () {
            var g = new createjs.Graphics();
            g.setStrokeStyle(1);
            g.beginStroke("rgba(0,0,0,0.75)");
            var i;
            for (i = Config.GRID_SIZE; i < this.canvasWidth; i += Config.GRID_SIZE) {
                if (i == this.roomX) {
                    g.beginStroke("rgba(255,255,255,0.75)");
                }
                g.mt(i, 0);
                g.lt(i, this.canvasHeight);
                if (i == this.roomX) {
                    g.beginStroke("rgba(0,0,0,0.75)");
                }
            }
            for (i = Config.GRID_SIZE; i < this.canvasHeight; i += Config.GRID_SIZE) {
                if (i == this.roomY) {
                    g.beginStroke("rgba(255,255,255,0.75)");
                }
                g.mt(0, i);
                g.lt(this.canvasWidth, i);
                if (i == this.roomY) {
                    g.beginStroke("rgba(0,0,0,0.75)");
                }
            }
            g.es();
            this.grid = new createjs.Shape(g);
            this.grid.x = this.grid.y = -.5;
            this.stage.addChild(this.grid);
            this.stage.update();
        };
        Editor.prototype.loadRooms = function () {
            this.roomQueue = new createjs.LoadQueue(false);
            this.roomQueue.on("fileload", this.handleLoadRoom, this);
            this.roomQueue.on("complete", this.handleLoadComplete, this);
            this.roomQueue.loadManifest("js/rooms.json");
        };
        Editor.prototype.showRoom = function (next) {
            if (next === void 0) { next = true; }
            if (next) {
                this.currentRoom++;
            }
            else {
                this.currentRoom--;
            }
            if (this.currentRoom >= this.roomBitmaps.length) {
                this.currentRoom = 0;
            }
            if (this.currentRoom < 0) {
                this.currentRoom = this.roomBitmaps.length - 1;
            }
            var room = this.roomBitmaps[this.currentRoom];
            this.roomContainer.removeChildAt(0);
            var scaleX = (Math.round(room.getBounds().width / Config.GRID_SIZE) * Config.GRID_SIZE) / room.getBounds().width;
            var scaleY = (Math.round(room.getBounds().height / Config.GRID_SIZE) * Config.GRID_SIZE) / room.getBounds().height;
            room.scaleX = scaleX;
            room.scaleY = scaleY;
            // console.log(scaleX, scaleY);
            this.roomContainer.addChildAt(room, 0);
            this.roomText.text = "ID: " + this.roomItems[this.currentRoom].id + "\nEntry: " + (this.roomItems[this.currentRoom].root == 1);
            this.drawTiles();
            this.stage.update();
        };
        Editor.prototype.updateRoomOutput = function () {
            this.updateRoomDoors();
            var output = {
                "path": "slices/",
                "manifest": this.roomItems
            };
            var str = JSON.stringify(output);
            this.outputBoxElement.value = str;
        };
        Editor.prototype.updateRoomDoors = function () {
            var i, j, lastTile;
            var tiles = this.roomItems[this.currentRoom].tiles;
            var top, right, bottom, left;
            if (tiles === undefined || tiles.length === 0)
                return;
            var h = tiles[0].length;
            var v = tiles.length;
            // right/left
            for (i = 0; i < v; i++) {
                if (tiles[i] === undefined || tiles[i] === null)
                    continue;
                if (tiles[i][0] === "d" && left === undefined) {
                    left = [i];
                }
                if (tiles[i][0] === "w" && left !== undefined && left.length == 1) {
                    left.push((i - left[0]));
                }
                if (tiles[i][h - 1] === "d" && right === undefined) {
                    right = [i];
                }
                if (tiles[i][h - 1] === "w" && right !== undefined && right.length == 1) {
                    right.push((i - right[0]));
                }
            }
            // top/bottom
            for (j = 0; j < h; j++) {
                if (tiles[0][j] === undefined || tiles[0][j] === null)
                    continue;
                if (tiles[0][j] === "d" && top === undefined) {
                    top = [j];
                }
                if (tiles[0][j] === "w" && top !== undefined && top.length == 1) {
                    top.push((j - top[0]));
                }
                if (tiles[v - 1][j] === "d" && bottom === undefined) {
                    bottom = [j];
                }
                if (tiles[v - 1][j] === "w" && bottom !== undefined && bottom.length == 1) {
                    bottom.push((j - bottom[0]));
                }
            }
            this.roomItems[this.currentRoom].doors = {
                top: top,
                right: right,
                bottom: bottom,
                left: left
            };
        };
        Editor.prototype.handleSaveClick = function (event) {
            var output = {
                "path": "slices/",
                "manifest": this.roomItems
            };
            var str = JSON.stringify(output);
            var element = document.createElement('a');
            element.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(str));
            element.setAttribute('download', 'rooms.json');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
        };
        Editor.prototype.handleStageMouseMove = function (event) {
            var x = event.stageX;
            var y = event.stageY;
            this.mouseCursor.x = x;
            this.mouseCursor.y = y;
            this.stage.update();
        };
        Editor.prototype.handleRoomMouseDown = function (event) {
            this.isDrawing = true;
            var mX = event.stageX;
            var mY = event.stageY;
            // convert to tile x/y
            var tileX = Math.floor((mX - this.roomX) / Config.GRID_SIZE);
            var tileY = Math.floor((mY - this.roomY) / Config.GRID_SIZE);
            this.drawTile(tileX, tileY);
        };
        Editor.prototype.handleRoomMouseUp = function (event) {
            this.isDrawing = false;
            this.updateRoomOutput();
        };
        Editor.prototype.handleRoomMouseMove = function (event) {
            // console.log("move", event.stageX, event.stageY);
            if (!this.isDrawing)
                return;
            var mX = event.stageX;
            var mY = event.stageY;
            var bounds = this.roomContainer.getBounds();
            if (mX < bounds.x)
                return;
            if (mY < bounds.y)
                return;
            // convert to tile x/y
            var tileX = Math.floor((mX - this.roomX) / Config.GRID_SIZE);
            var tileY = Math.floor((mY - this.roomY) / Config.GRID_SIZE);
            // outer bounds for draw
            var maxTileX = Math.floor(bounds.width / Config.GRID_SIZE) - 1;
            var maxTileY = Math.floor(bounds.height / Config.GRID_SIZE) - 1;
            // console.log(maxTileX, maxTileY, tileX, tileY);
            if (tileX > maxTileX)
                return;
            if (tileY > maxTileY)
                return;
            this.drawTile(tileX, tileY);
        };
        Editor.prototype.handleTileButtonClick = function (event) {
            this.updateCursor(event.target.name);
        };
        Editor.prototype.handleKeyDown = function (event) {
            var code = event.keyCode;
            // console.log("key", code);
            if (code == 39) {
                // right
                this.showRoom();
            }
            else if (code == 37) {
                // left
                this.showRoom(false);
            }
            else if (code == 68) {
                // D
                this.updateCursor("door");
            }
            else if (code == 87) {
                // W
                this.updateCursor("wall");
            }
            else if (code == 70) {
                // F
                this.updateCursor("floor");
            }
            else if (code == 88) {
                // X
                this.updateCursor("delete");
            }
        };
        Editor.prototype.handleLoadRoom = function (event) {
            if (event.item.type == createjs.LoadQueue.MANIFEST)
                return;
            var room = new createjs.Bitmap(event.item.src);
            room.x = this.roomX; // this.canvasWidth * .5 - room.getBounds().width * .5;
            room.y = this.roomY; // this.canvasHeight * .5 - room.getBounds().height * .5;
            this.roomBitmaps.push(room);
            var data = {
                id: event.item.id,
                src: event.item.src.replace(event.item.path, ""),
                url: event.item.src,
                root: event.item.root,
                tiles: event.item.tiles,
                doors: event.item.doors
            };
            this.roomItems.push(data);
            console.log(event.item.src);
        };
        Editor.prototype.handleLoadComplete = function (event) {
            console.log("complete!");
            this.showRoom();
            this.updateRoomOutput();
        };
        Editor.prototype.handleTick = function (event) {
            // console.log("tick!");
            if (!event.paused) {
            }
        };
        return Editor;
    })();
    Mansion.Editor = Editor;
})(Mansion || (Mansion = {}));
///<reference path='Editor.ts' />
///<reference path='typings/tsd.d.ts' />
var Mansion;
(function (Mansion_1) {
    var Mansion = (function () {
        function Mansion() {
            var _this = this;
            this.roomItems = [];
            this.mazeRooms = [];
            this.mazeTiles = [];
            this.standingRoom = 0;
            this.showDebug = true;
            this.lastDebugToggle = 0;
            this.panSpeed = 1;
            this.keyDelay = 10;
            this.canvas = document.getElementById("easelCanvas");
            this.stage = new createjs.Stage("easelCanvas");
            createjs.Ticker.on("tick", this.handleTick, this);
            window.onresize = this.handleResize.bind(this);
            this.keyboardController({
                68: function () { _this.toggleDebug(); },
                32: function () { },
                37: function () { _this.left(); },
                38: function () { _this.up(); },
                39: function () { _this.right(); },
                40: function () { _this.down(); }
            }, this.keyDelay);
            this.handleResize();
        }
        Mansion.prototype.toggleDebug = function () {
            if (createjs.Ticker.getTime() - this.lastDebugToggle < 500)
                return;
            this.lastDebugToggle = createjs.Ticker.getTime();
            this.showDebug = !this.showDebug;
            this.refreshDebug();
        };
        Mansion.prototype.refreshDebug = function () {
            if (this.showDebug) {
                this.drawRoomTiles();
            }
            else {
                this.tileShape.graphics.clear();
            }
        };
        Mansion.prototype.mansion = function () {
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
        };
        Mansion.prototype.startMaze = function () {
            this.addBaseRoom();
            // put avatar
            var g = new createjs.Graphics();
            var off = -Mansion_1.Config.AVATAR_SIZE;
            g.f("#00ffff")
                .ss(0)
                .r(off + 0, off + 0, Mansion_1.Config.AVATAR_SIZE * 2, Mansion_1.Config.AVATAR_SIZE * 2)
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
            var width = this.mazeRooms[0].roomData.tiles[0].length * Mansion_1.Config.AVATAR_SIZE;
            var height = this.mazeRooms[0].roomData.tiles.length * Mansion_1.Config.AVATAR_SIZE;
            this.panTo(x + (-width * .5), y + (-height * .5));
        };
        Mansion.prototype.right = function () {
            this.avatar.rotation = 90;
            this.pan(-1, 0);
        };
        Mansion.prototype.left = function () {
            this.avatar.rotation = -90;
            this.pan(1, 0);
        };
        Mansion.prototype.up = function () {
            this.avatar.rotation = 0;
            this.pan(0, 1);
        };
        Mansion.prototype.down = function () {
            this.avatar.rotation = 180;
            this.pan(0, -1);
        };
        Mansion.prototype.pan = function (x, y) {
            var currentRoom = this.avatarInRoom();
            if (currentRoom === undefined)
                return;
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
            if (collidesDoor)
                this.processDoorCollision(tiles, currentRoom);
            this.roomContainer.x = newX;
            this.roomContainer.y = newY;
            this.tileShape.x = this.roomContainer.x;
            this.tileShape.y = this.roomContainer.y;
        };
        Mansion.prototype.processDoorCollision = function (tiles, currentRoom) {
            var collidingDoor = this.findCollidingDoor(tiles, currentRoom.roomData);
            // NOTE: works only for single-door walls
            if (!collidingDoor || currentRoom.doorsUsed[collidingDoor.position].length !== 0)
                return;
            console.log("new room!");
            currentRoom.doorsUsed[collidingDoor.position] = collidingDoor.data;
            var complementRoom = this.findComplementaryRoom(collidingDoor);
            if (!complementRoom)
                return;
            var xRoom = currentRoom.x;
            var yRoom = currentRoom.y;
            var xDoor = 0;
            var yDoor = 0;
            var xOffset;
            var yOffset;
            var w = complementRoom.tiles[0].length * Mansion_1.Config.GRID_SIZE;
            var h = complementRoom.tiles.length * Mansion_1.Config.GRID_SIZE;
            var x = 0;
            var y = 0;
            // put the new room
            var complementDoorPos;
            var newPos;
            switch (collidingDoor.position) {
                case "top":
                    xDoor = (collidingDoor.data[0] * Mansion_1.Config.GRID_SIZE);
                    yDoor = 0;
                    complementDoorPos = complementRoom.doors.bottom;
                    xOffset = complementDoorPos[0] * Mansion_1.Config.GRID_SIZE;
                    yOffset = h;
                    x = xRoom - xOffset + xDoor;
                    y = yRoom - yOffset;
                    newPos = "bottom";
                    break;
                case "bottom":
                    xDoor = (collidingDoor.data[0] * Mansion_1.Config.GRID_SIZE);
                    yDoor = (currentRoom.roomData.tiles.length * Mansion_1.Config.GRID_SIZE);
                    complementDoorPos = complementRoom.doors.top;
                    xOffset = complementDoorPos[0] * Mansion_1.Config.GRID_SIZE;
                    yOffset = 0;
                    x = xRoom - xOffset + xDoor;
                    y = yRoom + yDoor;
                    newPos = "top";
                    break;
                case "left":
                    xDoor = 0;
                    yDoor = (collidingDoor.data[0] * Mansion_1.Config.GRID_SIZE);
                    complementDoorPos = complementRoom.doors.right;
                    xOffset = w;
                    yOffset = complementDoorPos[0] * Mansion_1.Config.GRID_SIZE;
                    x = xRoom - xOffset;
                    y = yRoom - yOffset + yDoor;
                    newPos = "right";
                    break;
                case "right":
                    xDoor = (currentRoom.roomData.tiles[0].length * Mansion_1.Config.GRID_SIZE);
                    yDoor = (collidingDoor.data[0] * Mansion_1.Config.GRID_SIZE);
                    complementDoorPos = complementRoom.doors.left;
                    xOffset = 0;
                    yOffset = complementDoorPos[0] * Mansion_1.Config.GRID_SIZE;
                    x = xRoom + xDoor;
                    y = yRoom - yOffset + yDoor;
                    newPos = "left";
                    break;
            }
            var newRoom = this.createRoomBitmap(complementRoom, x, y);
            newRoom.doorsUsed[newPos] = complementDoorPos;
        };
        Mansion.prototype.createRoomBitmap = function (roomData, x, y) {
            var gs = Mansion_1.Config.GRID_SIZE;
            var roomURL = roomData.url;
            var room = new createjs.Bitmap(roomURL);
            var bounds = room.getBounds();
            room.x = x;
            room.y = y;
            var scaleX = (Math.round(bounds.width / gs) * gs) / bounds.width;
            var scaleY = (Math.round(bounds.height / gs) * gs) / bounds.height;
            room.scaleX = scaleX;
            room.scaleY = scaleY;
            this.roomContainer.addChild(room);
            var newRoom = { roomData: roomData, x: x, y: y, doorsUsed: { top: [], right: [], bottom: [], left: [] } };
            this.mazeRooms.push(newRoom);
            this.refreshDebug();
            this.stage.update();
            return newRoom;
        };
        Mansion.prototype.panTo = function (x, y) {
            this.tileShape.x = this.roomContainer.x = x;
            this.tileShape.y = this.roomContainer.y = y;
        };
        Mansion.prototype.avatarInTilesInRoom = function (globalX, globalY, room) {
            // tells which tiles in the room the avatar is standing on top of
            var x = -globalX - room.x;
            var y = -globalY - room.y;
            var gs = Mansion_1.Config.GRID_SIZE;
            var as = Mansion_1.Config.AVATAR_SIZE;
            var roomX = room.x;
            var roomY = room.y;
            var w = room.roomData.tiles[0].length * gs;
            var h = room.roomData.tiles.length * gs;
            var x1 = Math.floor((x - as) / gs);
            var x2 = Math.ceil((x + as) / gs);
            var y1 = Math.floor((y - as) / gs);
            var y2 = Math.ceil((y + as) / gs);
            return { x1: x1, y1: y1, x2: x2, y2: y2 };
        };
        Mansion.prototype.avatarCollides = function (avatarTiles, room, type) {
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
        };
        Mansion.prototype.findCollidingDoor = function (avatarTiles, room) {
            var x1 = avatarTiles.x1;
            var x2 = avatarTiles.x2;
            var y1 = avatarTiles.y1;
            var y2 = avatarTiles.y2;
            var doors = room.doors;
            var w = room.tiles[0].length;
            var h = room.tiles.length;
            if ((y1 === 0 || y2 === 0) && x1 >= doors.top[0] && x1 <= doors.top[0] + doors.top[1]) {
                return { position: "top", data: doors.top };
            }
            if ((y1 === h || y2 === h) && x1 >= doors.bottom[0] && x1 <= doors.bottom[0] + doors.bottom[1]) {
                return { position: "bottom", data: doors.bottom };
            }
            if ((x1 === 0 || x2 === 0) && y1 >= doors.left[0] && y1 <= doors.left[0] + doors.left[1]) {
                return { position: "left", data: doors.left };
            }
            if ((x1 === w || x2 === w) && y1 >= doors.right[0] && y1 <= doors.right[0] + doors.right[1]) {
                return { position: "right", data: doors.right };
            }
            return undefined;
        };
        Mansion.prototype.findComplementaryRoom = function (toDoor) {
            var pos;
            var rndRooms = _.shuffle(this.roomItems);
            switch (toDoor.position) {
                case "top":
                    pos = "bottom";
                    break;
                case "bottom":
                    pos = "top";
                    break;
                case "left":
                    pos = "right";
                    break;
                case "right":
                    pos = "left";
                    break;
            }
            for (var key in rndRooms) {
                var room = rndRooms[key];
                // check door size matches
                // NOTE: only works for single-door walls
                if (room && room.doors && room.doors[pos] && room.doors[pos][1] === toDoor.data[1]) {
                    return room;
                }
            }
        };
        Mansion.prototype.avatarInRoom = function () {
            return this.roomAtXY(0, 0);
        };
        Mansion.prototype.roomAtXY = function (x, y) {
            for (var roomKey in this.mazeRooms) {
                var room = this.mazeRooms[roomKey];
                var w = room.roomData.tiles[0].length * Mansion_1.Config.GRID_SIZE;
                var h = room.roomData.tiles.length * Mansion_1.Config.GRID_SIZE;
                if (x >= room.x + this.roomContainer.x && x <= room.x + w + this.roomContainer.x && y >= room.y + this.roomContainer.y && y <= room.y + h + this.roomContainer.y) {
                    return room;
                }
            }
            return undefined;
        };
        Mansion.prototype.addBaseRoom = function () {
            var x = 0, y = 0;
            var gs = Mansion_1.Config.GRID_SIZE;
            var roomIndex = this.chooseRandomRoom();
            var roomData = this.roomItems[roomIndex];
            this.createRoomBitmap(roomData, x, y);
        };
        Mansion.prototype.drawRoomTiles = function () {
            var i;
            var g = new createjs.Graphics();
            g.setStrokeStyle(0);
            for (i = 0; i < this.mazeRooms.length; i++) {
                var room = this.mazeRooms[i];
                this.drawTiles(g, room);
            }
            g.ef();
            this.tileShape.graphics = g;
        };
        Mansion.prototype.drawTiles = function (g, room) {
            var i, j;
            var roomData = room.roomData;
            var tiles = roomData.tiles;
            var color;
            var gs = Mansion_1.Config.GRID_SIZE;
            for (i = 0; i < tiles.length; i++) {
                if (tiles[i] === undefined || tiles[i] === null)
                    continue;
                for (j = 0; j < tiles[i].length; j++) {
                    switch (tiles[i][j]) {
                        case "f":
                            color = Mansion_1.Config.FLOOR_COLOR;
                            break;
                        case "d":
                            color = Mansion_1.Config.DOOR_COLOR;
                            break;
                        case "w":
                            color = Mansion_1.Config.WALL_COLOR;
                            break;
                        default:
                            color = "";
                            break;
                    }
                    if (color !== "")
                        g.f(color).r(room.x + (j * gs), room.y + (i * gs), gs, gs);
                }
            }
        };
        Mansion.prototype.chooseRandomRoom = function () {
            var index;
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
        };
        Mansion.prototype.loadRooms = function () {
            this.roomQueue = new createjs.LoadQueue(false);
            this.roomQueue.on("fileload", this.handleLoadRoom, this);
            this.roomQueue.on("complete", this.handleLoadComplete, this);
            this.roomQueue.loadManifest("js/rooms.json");
        };
        Mansion.prototype.handleLoadRoom = function (event) {
            if (event.item.type == "manifest")
                return;
            var room = event.item.src;
            var data = {
                id: event.item.id,
                src: event.item.src.replace(event.item.path, ""),
                url: event.item.src,
                root: event.item.root,
                tiles: event.item.tiles,
                doors: event.item.doors
            };
            this.roomItems.push(data);
            console.log(data);
        };
        Mansion.prototype.handleLoadComplete = function (event) {
            console.log("complete!");
            this.startMaze();
        };
        Mansion.prototype.handleResize = function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        Mansion.prototype.keyboardController = function (keys, repeat) {
            // Lookup of key codes to timer ID, or null for no repeat
            //
            var timers = {};
            // When key is pressed and we don't already think it's pressed, call the
            // key action callback and set a timer to generate another one after a delay
            //
            document.onkeydown = function (event) {
                var key = (event || window.event).keyCode;
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
            document.onkeyup = function (event) {
                var key = (event || window.event).keyCode;
                if (key in timers) {
                    if (timers[key] !== null)
                        clearInterval(timers[key]);
                    delete timers[key];
                }
            };
            // When window is unfocused we may not get key events. To prevent this
            // causing a key to 'get stuck down', cancel all held keys
            //
            window.onblur = function () {
                for (var key in timers)
                    if (timers[key] !== null)
                        clearInterval(timers[key]);
                timers = {};
            };
        };
        ;
        Mansion.prototype.handleTick = function (event) {
            // console.log("tick!");
            this.stage.update();
            if (!event.paused) {
            }
        };
        return Mansion;
    })();
    Mansion_1.Mansion = Mansion;
})(Mansion || (Mansion = {}));
