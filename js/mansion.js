///<reference path='typings/tsd.d.ts' />
var Mansion;
(function (Mansion) {
    var Editor = (function () {
        function Editor() {
            this.roomBitmaps = [];
            this.roomItems = [];
            this.currentRoom = -1;
            this.gridSize = 20;
            this.canvasWidth = 1024;
            this.canvasHeight = 800;
            this.roomX = 200;
            this.roomY = 160;
            this.tileType = "floor";
            this.wallColor = "#ff0000";
            this.floorColor = "#ffffff";
            this.doorColor = "#00ffff";
            this.deleteColor = "#000000";
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
            var gs = this.gridSize;
            for (i = 0; i < tiles.length; i++) {
                if (tiles[i] === undefined || tiles[i] === null)
                    continue;
                for (j = 0; j < tiles[i].length; j++) {
                    switch (tiles[i][j]) {
                        case "f":
                            color = this.floorColor;
                            break;
                        case "d":
                            color = this.doorColor;
                            break;
                        case "w":
                            color = this.wallColor;
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
                    color = this.floorColor;
                    break;
                case "door":
                    color = this.doorColor;
                    break;
                case "wall":
                    color = this.wallColor;
                    break;
                case "delete":
                    color = this.deleteColor;
                    break;
            }
            this.mouseCursor.graphics.c().f(color).r(0, 0, this.gridSize * .5, this.gridSize * .5);
            this.stage.update();
        };
        Editor.prototype.drawUI = function () {
            var g, text;
            g = new createjs.Graphics();
            g.f(this.wallColor).r(0, 0, this.gridSize * 6, this.gridSize);
            var wallButton = new createjs.Shape(g);
            wallButton.name = "wall";
            wallButton.cursor = "pointer";
            wallButton.x = this.gridSize;
            wallButton.y = this.gridSize;
            this.stage.addChild(wallButton);
            wallButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Wall", "16px Arial", this.deleteColor);
            text.x = this.gridSize * 3;
            text.y = this.gridSize + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(this.floorColor).r(0, 0, this.gridSize * 6, this.gridSize);
            var floorButton = new createjs.Shape(g);
            floorButton.name = "floor";
            floorButton.cursor = "pointer";
            floorButton.x = this.gridSize;
            floorButton.y = this.gridSize * 2;
            this.stage.addChild(floorButton);
            floorButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Floor", "16px Arial", this.deleteColor);
            text.x = this.gridSize * 3;
            text.y = this.gridSize * 2 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(this.doorColor).r(0, 0, this.gridSize * 6, this.gridSize);
            var doorButton = new createjs.Shape(g);
            doorButton.name = "door";
            doorButton.cursor = "pointer";
            doorButton.x = this.gridSize;
            doorButton.y = this.gridSize * 3;
            this.stage.addChild(doorButton);
            doorButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Door", "16px Arial", this.deleteColor);
            text.x = this.gridSize * 3;
            text.y = this.gridSize * 3 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(this.deleteColor).r(0, 0, this.gridSize * 6, this.gridSize);
            var deleteButton = new createjs.Shape(g);
            deleteButton.name = "delete";
            deleteButton.cursor = "pointer";
            deleteButton.x = this.gridSize;
            deleteButton.y = this.gridSize * 4;
            this.stage.addChild(deleteButton);
            deleteButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Delete", "16px Arial", this.floorColor);
            text.x = this.gridSize * 3;
            text.y = this.gridSize * 4 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(this.deleteColor).r(0, 0, this.gridSize * 6, this.gridSize);
            var clearButton = new createjs.Shape(g);
            clearButton.name = "clear";
            clearButton.cursor = "pointer";
            clearButton.x = this.gridSize;
            clearButton.y = this.gridSize * 6;
            this.stage.addChild(clearButton);
            clearButton.on("click", this.clearTiles, this);
            text = new createjs.Text("Clear", "16px Arial", this.floorColor);
            text.x = this.gridSize * 3;
            text.y = this.gridSize * 6 + 2;
            this.stage.addChild(text);
            this.roomText = new createjs.Text("", "16px Arial", "#ffffff");
            this.roomText.x = this.gridSize;
            this.roomText.y = this.roomY + this.gridSize;
            this.stage.addChild(this.roomText);
            this.stage.update();
        };
        Editor.prototype.drawGrid = function () {
            var g = new createjs.Graphics();
            g.setStrokeStyle(1);
            g.beginStroke("rgba(0,0,0,0.75)");
            var i;
            for (i = this.gridSize; i < this.canvasWidth; i += this.gridSize) {
                if (i == this.roomX) {
                    g.beginStroke("rgba(255,255,255,0.75)");
                }
                g.mt(i, 0);
                g.lt(i, this.canvasHeight);
                if (i == this.roomX) {
                    g.beginStroke("rgba(0,0,0,0.75)");
                }
            }
            for (i = this.gridSize; i < this.canvasHeight; i += this.gridSize) {
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
            var scaleX = (Math.round(room.getBounds().width / this.gridSize) * this.gridSize) / room.getBounds().width;
            var scaleY = (Math.round(room.getBounds().height / this.gridSize) * this.gridSize) / room.getBounds().height;
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
            var tileX = Math.floor((mX - this.roomX) / this.gridSize);
            var tileY = Math.floor((mY - this.roomY) / this.gridSize);
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
            var tileX = Math.floor((mX - this.roomX) / this.gridSize);
            var tileY = Math.floor((mY - this.roomY) / this.gridSize);
            // outer bounds for draw
            var maxTileX = Math.floor(bounds.width / this.gridSize) - 1;
            var maxTileY = Math.floor(bounds.height / this.gridSize) - 1;
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
            this.roomURLs = [];
            this.roomItems = [];
            this.mazeRooms = [];
            this.mazeTiles = [];
            this.standingRoom = 0;
            this.showDebug = true;
            this.gridSize = 20;
            this.panSpeed = 2;
            this.wallColor = "#ff0000";
            this.floorColor = "#ffffff";
            this.doorColor = "#00ffff";
            this.canvas = document.getElementById("easelCanvas");
            this.stage = new createjs.Stage("easelCanvas");
            createjs.Ticker.on("tick", this.handleTick, this);
            window.onresize = this.handleResize.bind(this);
            this.keyboardController({
                32: function () { _this.addRoomToMaze(); },
                37: function () { _this.left(); },
                38: function () { _this.up(); },
                39: function () { _this.right(); },
                40: function () { _this.down(); }
            }, 10);
            this.handleResize();
        }
        Mansion.prototype.toggleDebug = function () {
            this.showDebug = !this.showDebug;
            this.refreshDebug();
        };
        Mansion.prototype.refreshDebug = function () {
            this.tileShape.graphics.clear();
            if (this.showDebug) {
                this.drawRoomTiles();
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
            this.addRoomToMaze();
            // put avatar
            var g = new createjs.Graphics();
            var off = -this.gridSize;
            g.f("#00ffff")
                .ss(0)
                .r(off + 0, off + 0, this.gridSize * 2, this.gridSize * 2)
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
            var width = this.mazeRooms[0].roomData.tiles[0].length * this.gridSize;
            var height = this.mazeRooms[0].roomData.tiles.length * this.gridSize;
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
            if (this.avatarCollides(tiles, currentRoom.roomData)) {
                newX = oldX;
                newY = oldY;
            }
            this.roomContainer.x = newX;
            this.roomContainer.y = newY;
            this.tileShape.x = this.roomContainer.x;
            this.tileShape.y = this.roomContainer.y;
        };
        Mansion.prototype.panTo = function (x, y) {
            this.tileShape.x = this.roomContainer.x = x;
            this.tileShape.y = this.roomContainer.y = y;
        };
        Mansion.prototype.avatarInTilesInRoom = function (x, y, room) {
            x = -x;
            y = -y;
            var gs = this.gridSize;
            var roomX = room.x;
            var roomY = room.y;
            var w = room.roomData.tiles[0].length * gs;
            var h = room.roomData.tiles.length * gs;
            var x1 = Math.floor((x - gs) / gs);
            var x2 = Math.floor((x + gs) / gs);
            var y1 = Math.floor((y - gs) / gs);
            var y2 = Math.floor((y + gs) / gs);
            return { x1: x1, y1: y1, x2: x2, y2: y2 };
        };
        Mansion.prototype.avatarCollides = function (avatarTiles, room) {
            var x1 = avatarTiles.x1;
            var x2 = avatarTiles.x2;
            var y1 = avatarTiles.y1;
            var y2 = avatarTiles.y2;
            for (var i = 0; i < room.tiles.length; i++) {
                for (var j = 0; j < room.tiles[i].length; j++) {
                    if (i >= y1 && i <= y2 && j >= x1 && j <= x2 && room.tiles[i][j] === "w") {
                        return true;
                    }
                }
            }
            return false;
        };
        Mansion.prototype.avatarInRoom = function () {
            return this.roomAtXY(0, 0);
        };
        Mansion.prototype.roomAtXY = function (x, y) {
            for (var roomKey in this.mazeRooms) {
                var room = this.mazeRooms[roomKey];
                var w = room.roomData.tiles[0].length * this.gridSize;
                var h = room.roomData.tiles.length * this.gridSize;
                if (x >= room.x + this.roomContainer.x && x <= room.x + w + this.roomContainer.x && y >= room.y + this.roomContainer.y && y <= room.y + h + this.roomContainer.y) {
                    return room;
                }
            }
            return undefined;
        };
        Mansion.prototype.addRoomToMaze = function () {
            var x = 0, y = 0;
            var l = this.mazeRooms.length;
            var parentRoom;
            var gs = this.gridSize;
            if (l > 0) {
                parentRoom = this.mazeRooms[l - 1];
                x = parentRoom.x + (parentRoom.roomData.tiles[0].length * gs);
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
            this.mazeRooms.push({ roomData: roomData, x: x, y: y });
            this.refreshDebug();
            this.stage.update();
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
            var gs = this.gridSize;
            for (i = 0; i < tiles.length; i++) {
                if (tiles[i] === undefined || tiles[i] === null)
                    continue;
                for (j = 0; j < tiles[i].length; j++) {
                    switch (tiles[i][j]) {
                        case "f":
                            color = this.floorColor;
                            break;
                        case "d":
                            color = this.doorColor;
                            break;
                        case "w":
                            color = this.wallColor;
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
            this.roomURLs.push(room);
            var data = {
                id: event.item.id,
                src: event.item.src.replace(event.item.path, ""),
                root: event.item.root,
                tiles: event.item.tiles,
                doors: event.item.doors
            };
            this.roomItems.push(data);
            console.log(event.item.src);
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
