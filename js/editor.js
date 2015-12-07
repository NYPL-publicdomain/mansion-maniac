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
})(Mansion || (Mansion = {}));
///<reference path='Config.ts' />
///<reference path='typings/tsd.d.ts' />
var Mansion;
(function (Mansion) {
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
            this.canvas = document.getElementById("easelCanvas");
            this.outputBoxElement = document.getElementById("output");
            this.saveButtonElement = document.getElementById("save");
            this.saveButtonElement.onclick = this.handleSaveClick.bind(this);
            this.stage = new createjs.Stage("easelCanvas");
            this.stage.enableMouseOver(10);
            window.onresize = this.handleResize.bind(this);
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
            this.handleResize();
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
            this.grid = new createjs.Shape();
            this.grid.x = this.grid.y = -.5;
            this.stage.addChild(this.grid);
        };
        Editor.prototype.clearTiles = function () {
            this.roomItems[this.currentRoom].tiles = [];
            this.drawTiles();
            this.updateRoomOutput();
        };
        Editor.prototype.toggleRoot = function () {
            this.roomItems[this.currentRoom].root = this.roomItems[this.currentRoom].root == 1 ? 0 : 1;
            this.roomText.text = "ID: " + this.roomItems[this.currentRoom].id + "\nEntry: " + (this.roomItems[this.currentRoom].root == 1);
            this.stage.update();
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
            var gs = Mansion.Config.GRID_SIZE;
            for (i = 0; i < tiles.length; i++) {
                if (tiles[i] === undefined || tiles[i] === null)
                    continue;
                for (j = 0; j < tiles[i].length; j++) {
                    switch (tiles[i][j]) {
                        case "f":
                            color = Mansion.Config.FLOOR_COLOR;
                            break;
                        case "d":
                            color = Mansion.Config.DOOR_COLOR;
                            break;
                        case "w":
                            color = Mansion.Config.WALL_COLOR;
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
                    color = Mansion.Config.FLOOR_COLOR;
                    break;
                case "door":
                    color = Mansion.Config.DOOR_COLOR;
                    break;
                case "wall":
                    color = Mansion.Config.WALL_COLOR;
                    break;
                case "delete":
                    color = Mansion.Config.DELETE_COLOR;
                    break;
            }
            this.mouseCursor.graphics.c().f(color).r(0, 0, Mansion.Config.GRID_SIZE * .5, Mansion.Config.GRID_SIZE * .5);
            this.stage.update();
        };
        Editor.prototype.drawUI = function () {
            var g, text;
            g = new createjs.Graphics();
            g.f(Mansion.Config.WALL_COLOR).r(0, 0, Mansion.Config.GRID_SIZE * 6, Mansion.Config.GRID_SIZE);
            var wallButton = new createjs.Shape(g);
            wallButton.name = "wall";
            wallButton.cursor = "pointer";
            wallButton.x = Mansion.Config.GRID_SIZE;
            wallButton.y = Mansion.Config.GRID_SIZE;
            this.stage.addChild(wallButton);
            wallButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Wall", "16px Arial", Mansion.Config.DELETE_COLOR);
            text.x = Mansion.Config.GRID_SIZE * 3;
            text.y = Mansion.Config.GRID_SIZE + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Mansion.Config.FLOOR_COLOR).r(0, 0, Mansion.Config.GRID_SIZE * 6, Mansion.Config.GRID_SIZE);
            var floorButton = new createjs.Shape(g);
            floorButton.name = "floor";
            floorButton.cursor = "pointer";
            floorButton.x = Mansion.Config.GRID_SIZE;
            floorButton.y = Mansion.Config.GRID_SIZE * 2;
            this.stage.addChild(floorButton);
            floorButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Floor", "16px Arial", Mansion.Config.DELETE_COLOR);
            text.x = Mansion.Config.GRID_SIZE * 3;
            text.y = Mansion.Config.GRID_SIZE * 2 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Mansion.Config.DOOR_COLOR).r(0, 0, Mansion.Config.GRID_SIZE * 6, Mansion.Config.GRID_SIZE);
            var doorButton = new createjs.Shape(g);
            doorButton.name = "door";
            doorButton.cursor = "pointer";
            doorButton.x = Mansion.Config.GRID_SIZE;
            doorButton.y = Mansion.Config.GRID_SIZE * 3;
            this.stage.addChild(doorButton);
            doorButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Door", "16px Arial", Mansion.Config.DELETE_COLOR);
            text.x = Mansion.Config.GRID_SIZE * 3;
            text.y = Mansion.Config.GRID_SIZE * 3 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Mansion.Config.DELETE_COLOR).r(0, 0, Mansion.Config.GRID_SIZE * 6, Mansion.Config.GRID_SIZE);
            var deleteButton = new createjs.Shape(g);
            deleteButton.name = "delete";
            deleteButton.cursor = "pointer";
            deleteButton.x = Mansion.Config.GRID_SIZE;
            deleteButton.y = Mansion.Config.GRID_SIZE * 4;
            this.stage.addChild(deleteButton);
            deleteButton.on("click", this.handleTileButtonClick, this);
            text = new createjs.Text("Delete", "16px Arial", Mansion.Config.FLOOR_COLOR);
            text.x = Mansion.Config.GRID_SIZE * 3;
            text.y = Mansion.Config.GRID_SIZE * 4 + 2;
            this.stage.addChild(text);
            g = new createjs.Graphics();
            g.f(Mansion.Config.DELETE_COLOR).r(0, 0, Mansion.Config.GRID_SIZE * 6, Mansion.Config.GRID_SIZE);
            var clearButton = new createjs.Shape(g);
            clearButton.name = "clear";
            clearButton.cursor = "pointer";
            clearButton.x = Mansion.Config.GRID_SIZE;
            clearButton.y = Mansion.Config.GRID_SIZE * 6;
            this.stage.addChild(clearButton);
            clearButton.on("click", this.clearTiles, this);
            text = new createjs.Text("Clear", "16px Arial", Mansion.Config.FLOOR_COLOR);
            text.x = Mansion.Config.GRID_SIZE * 3;
            text.y = Mansion.Config.GRID_SIZE * 6 + 2;
            this.stage.addChild(text);
            this.roomText = new createjs.Text("", "16px Arial", "#ffffff");
            this.roomText.x = Mansion.Config.GRID_SIZE;
            this.roomText.y = this.roomY + Mansion.Config.GRID_SIZE;
            this.stage.addChild(this.roomText);
            this.stage.update();
        };
        Editor.prototype.drawGrid = function () {
            var g = new createjs.Graphics();
            g.setStrokeStyle(1);
            g.beginStroke("rgba(0,0,0,0.75)");
            var i;
            for (i = Mansion.Config.GRID_SIZE; i < this.canvasWidth; i += Mansion.Config.GRID_SIZE) {
                if (i == this.roomX) {
                    g.beginStroke("rgba(255,255,255,0.75)");
                }
                g.mt(i, 0);
                g.lt(i, this.canvasHeight);
                if (i == this.roomX) {
                    g.beginStroke("rgba(0,0,0,0.75)");
                }
            }
            for (i = Mansion.Config.GRID_SIZE; i < this.canvasHeight; i += Mansion.Config.GRID_SIZE) {
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
            this.grid.graphics = g;
            this.stage.update();
        };
        Editor.prototype.loadRooms = function () {
            this.roomQueue = new createjs.LoadQueue(false);
            this.roomQueue.on("fileload", this.handleLoadRoom, this);
            this.roomQueue.on("complete", this.handleLoadComplete, this);
            this.roomQueue.loadManifest("js/rooms.json?i=" + (Math.random() * 10000));
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
            var scaleX = (Math.round(room.getBounds().width / Mansion.Config.GRID_SIZE) * Mansion.Config.GRID_SIZE) / room.getBounds().width;
            var scaleY = (Math.round(room.getBounds().height / Mansion.Config.GRID_SIZE) * Mansion.Config.GRID_SIZE) / room.getBounds().height;
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
            var h = 0 || tiles[0].length;
            var v = 0 || tiles.length;
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
            var tileX = Math.floor((mX - this.roomX) / Mansion.Config.GRID_SIZE);
            var tileY = Math.floor((mY - this.roomY) / Mansion.Config.GRID_SIZE);
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
            var tileX = Math.floor((mX - this.roomX) / Mansion.Config.GRID_SIZE);
            var tileY = Math.floor((mY - this.roomY) / Mansion.Config.GRID_SIZE);
            // outer bounds for draw
            var maxTileX = Math.floor(bounds.width / Mansion.Config.GRID_SIZE) - 1;
            var maxTileY = Math.floor(bounds.height / Mansion.Config.GRID_SIZE) - 1;
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
            console.log("key", code);
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
            else if (code == 82) {
                // R
                this.toggleRoot();
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
                bitmap: {},
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
        Editor.prototype.handleResize = function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvasHeight = this.canvas.height;
            this.canvasWidth = this.canvas.width;
            this.drawGrid();
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
