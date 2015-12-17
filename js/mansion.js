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
        Config.AVATAR_SIZE = 16;
        return Config;
    })();
    Mansion.Config = Config;
})(Mansion || (Mansion = {}));
///<reference path='Config.ts' />
///<reference path='typings/tsd.d.ts' />
var Mansion;
(function (Mansion_1) {
    var Mansion = (function () {
        function Mansion() {
            var _this = this;
            this.roomItems = [];
            this.mazeRooms = [];
            this.standingRoom = 0;
            this.showDebug = false;
            this.lastDebugToggle = 0;
            this.lastReset = 0;
            this.lastSave = 0;
            this.panSpeed = 1;
            this.keyDelay = 10;
            this.scaleSpeed = 0.01;
            this.minScale = 0.15;
            this.maxScale = 3;
            this.tapAction = "";
            this.actionDelay = 6;
            this.loading = true;
            this.canvas = document.getElementById("easelCanvas");
            this.stage = new createjs.Stage("easelCanvas");
            createjs.Ticker.on("tick", this.handleTick, this);
            window.onresize = this.handleResize.bind(this);
            this.keyboardController({
                68: function () { _this.toggleDebug(); },
                32: function () { _this.reset(); },
                // 82: () => {  }, // R
                87: function () { _this.saveMansion(); },
                61: function () { _this.zoomIn(); },
                107: function () { _this.zoomIn(); },
                109: function () { _this.zoomOut(); },
                173: function () { _this.zoomOut(); },
                37: function () { _this.left(); },
                38: function () { _this.up(); },
                39: function () { _this.right(); },
                40: function () { _this.down(); }
            }, this.keyDelay);
            this.handleResize();
        }
        Mansion.prototype.endAction = function () {
            this.tapAction = "";
            clearInterval(this.actionInterval);
        };
        Mansion.prototype.startAction = function (action) {
            var _this = this;
            this.tapAction = action;
            clearInterval(this.actionInterval);
            this.actionInterval = setInterval(function () { _this.executeAction(); }, this.actionDelay);
        };
        Mansion.prototype.executeAction = function () {
            if (this.tapAction != "") {
                switch (this.tapAction) {
                    case "zoomin":
                        this.zoomIn();
                        break;
                    case "zoomout":
                        this.zoomOut();
                        break;
                    case "left":
                        this.left();
                        break;
                    case "right":
                        this.right();
                        break;
                    case "up":
                        this.up();
                        break;
                    case "down":
                        this.down();
                        break;
                }
            }
        };
        Mansion.prototype.zoomOut = function () {
            // if (createjs.Ticker.getTime() - this.lastScale < 500) return;
            var scale = this.stage.scaleX;
            scale = scale - this.scaleSpeed;
            if (scale >= this.minScale) {
                this.stage.scaleX = this.stage.scaleY = scale;
            }
        };
        Mansion.prototype.zoomIn = function () {
            // if (createjs.Ticker.getTime() - this.lastScale < 500) return;
            var scale = this.stage.scaleX;
            scale = scale + this.scaleSpeed;
            if (scale <= this.maxScale) {
                this.stage.scaleX = this.stage.scaleY = scale;
            }
        };
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
        Mansion.prototype.reset = function () {
            if (this.loading || createjs.Ticker.getTime() - this.lastReset < 500)
                return;
            this.lastReset = createjs.Ticker.getTime();
            this.roomContainer.removeAllChildren();
            this.tileShape.graphics.clear();
            this.mazeRooms = [];
            this.startMaze();
        };
        Mansion.prototype.addAvatar = function () {
            // put avatar
            var g = new createjs.Graphics();
            var off = -Mansion_1.Config.AVATAR_SIZE;
            var leftX = 6;
            var rightX = 22;
            var eyeDist = 2;
            var eyeSize = 10;
            var irisSize = 5;
            g.f("#00ffff")
                .ss(0)
                .r(off, off, Mansion_1.Config.AVATAR_SIZE * 2, Mansion_1.Config.AVATAR_SIZE * 2)
                .f("#ffffff")
                .r(off + leftX, off + eyeDist, eyeSize, eyeSize)
                .r(off + rightX, off + eyeDist, eyeSize, eyeSize)
                .f("#000000")
                .r(off + leftX + eyeDist, off + eyeDist + eyeDist, irisSize, irisSize)
                .r(off + rightX + eyeDist, off + eyeDist + eyeDist, irisSize, irisSize)
                .ef();
            this.avatarFront = new createjs.Shape(g);
            this.stage.addChild(this.avatarFront);
            g = new createjs.Graphics();
            g.f("#00ffff")
                .ss(0)
                .r(off, off, Mansion_1.Config.AVATAR_SIZE * 2, Mansion_1.Config.AVATAR_SIZE * 2)
                .f("#ffffff")
                .r(off + leftX, off, eyeSize, eyeSize)
                .r(off + rightX, off, eyeSize, eyeSize)
                .f("#000000")
                .r(off + leftX + eyeDist, off, irisSize, irisSize)
                .r(off + rightX + eyeDist, off, irisSize, irisSize)
                .ef();
            this.avatar = new createjs.Shape(g);
            this.stage.addChild(this.avatar);
            this.avatar.visible = false;
        };
        Mansion.prototype.saveMansion = function () {
            if (this.loading || createjs.Ticker.getTime() - this.lastSave < 500)
                return;
            this.lastSave = createjs.Ticker.getTime();
            // save the room container as a bitmap
            var bounds = this.roomContainer.getBounds();
            if (!bounds)
                return;
            // var shadow = new createjs.Shadow("#000000", -2, 2, 2);
            // var watermark = new createjs.Text("My Mansion", "24px 'Forum-Regular', 'Times New Roman', Times, serif", "#ffffff");
            // this.roomContainer.addChild(watermark);
            // var waterBounds = watermark.getBounds();
            // watermark.x = bounds.x + (-waterBounds.width * .5) + bounds.width * .5;
            // watermark.y = bounds.y + (-waterBounds.height * .5) + bounds.height * .5;
            // watermark.shadow = shadow;
            // var footer = new createjs.Text("Rooms from the “Apartment Houses of the Metropolis” collection\nin the New York Public Library (1908-1913)", "14px 'Forum-Regular', 'Times New Roman', Times, serif", "#ffffff");
            // footer.textAlign = "center";
            // this.roomContainer.addChild(footer);
            // var footerBounds = footer.getBounds();
            // footer.x = bounds.x + (-footerBounds.width * .5) + bounds.width * .5;
            // footer.y = bounds.y -footerBounds.height + bounds.height;
            // footer.shadow = shadow;
            this.roomContainer.cache(bounds.x, bounds.y, bounds.width, bounds.height);
            var url = this.roomContainer.getCacheDataURL();
            // prompt browser download
            var element = document.createElement('a');
            element.setAttribute('href', url);
            element.setAttribute('download', 'mansion.png');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            // refresh room container
            // this.roomContainer.removeChild(watermark);
            // this.roomContainer.removeChild(footer);
            this.roomContainer.uncache();
        };
        Mansion.prototype.startMaze = function () {
            this.addBaseRoom();
            var width = this.roomContainer.getBounds().width;
            var height = this.roomContainer.getBounds().height;
            this.panTo((-width * .5), (-height * .5));
            this.updateScore();
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
            this.avatar.visible = true;
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
            this.updateScore();
        };
        Mansion.prototype.createRoomBitmap = function (roomData, x, y) {
            var gs = Mansion_1.Config.GRID_SIZE;
            var room = roomData.bitmap.clone();
            var bounds = room.getBounds();
            if (!bounds) {
                console.log("could not create room:", roomData);
                return;
            }
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
            if ((y1 === 0 || y2 === 0) && doors.top && x1 >= doors.top[0] && x1 <= doors.top[0] + doors.top[1]) {
                return { position: "top", data: doors.top };
            }
            if ((y1 === h || y2 === h) && doors.bottom && x1 >= doors.bottom[0] && x1 <= doors.bottom[0] + doors.bottom[1]) {
                return { position: "bottom", data: doors.bottom };
            }
            if ((x1 === 0 || x2 === 0) && doors.left && y1 >= doors.left[0] && y1 <= doors.left[0] + doors.left[1]) {
                return { position: "left", data: doors.left };
            }
            if ((x1 === w || x2 === w) && doors.right && y1 >= doors.right[0] && y1 <= doors.right[0] + doors.right[1]) {
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
            var count = 0;
            while (count < 20) {
                for (var r in rndRooms) {
                    var room = rndRooms[r];
                    // check door size matches
                    // NOTE: only works for single-door walls
                    if (room && room.root != 1 && room.doors && room.doors[pos] && room.doors[pos][1] === toDoor.data[1]) {
                        return room;
                    }
                }
                count++;
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
            var roomData;
            var roomIndex;
            var count = 0;
            var found = false;
            while (!found) {
                roomIndex = this.chooseRandomRoom();
                roomData = this.roomItems[roomIndex];
                found = (roomData.root == 1);
            }
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
        Mansion.prototype.updateScore = function () {
            var score = document.getElementById("score");
            var sqft = 0;
            for (var room in this.mazeRooms) {
                var tiles = this.mazeRooms[room].roomData.tiles;
                var area = tiles.length * tiles[0].length;
                sqft += area;
            }
            var sqm = Math.round(sqft * 0.09);
            var str = '~' + sqm + ' m<sup>2</sup> (~' + sqft + ' ft<sup>2</sup>)';
            score.innerHTML = str;
        };
        Mansion.prototype.loadCat = function () {
            var data = {
                images: ["images/cat.png"],
                frames: { width: 60, height: 60 },
                animations: {
                    stand: 0,
                    walk: {
                        frames: [1, 2, 3, 2, 1],
                        speed: 0.5
                    }
                }
            };
            var spriteSheet = new createjs.SpriteSheet(data);
            this.catSprite = new createjs.Sprite(spriteSheet);
            this.catSprite.x = -30;
            this.catSprite.y = -30;
            this.stage.addChild(this.catSprite);
        };
        Mansion.prototype.loadRooms = function () {
            this.roomQueue = new createjs.LoadQueue(false);
            this.roomQueue.on("fileload", this.handleLoadRoom, this);
            this.roomQueue.on("complete", this.handleLoadComplete, this);
            this.roomQueue.on("progress", this.handleProgress, this);
            this.roomQueue.loadManifest("js/rooms.json?i=" + (Math.random() * 10000));
        };
        Mansion.prototype.handleProgress = function (loaded) {
            var progress = document.getElementById("progress");
            progress.style.width = (loaded.loaded * 100) + "%";
        };
        Mansion.prototype.handleLoadRoom = function (event) {
            if (event.item.type == "manifest")
                return;
            var room = event.item.src;
            var data = {
                id: event.item.id,
                src: event.item.src.replace(event.item.path, ""),
                bitmap: new createjs.Bitmap(room),
                root: event.item.root,
                tiles: event.item.tiles,
                doors: event.item.doors
            };
            this.roomItems.push(data);
            console.log(room);
        };
        Mansion.prototype.handleLoadComplete = function (event) {
            var _this = this;
            console.log("complete!");
            var loader = document.getElementById("loader");
            var button = document.getElementById("start-button");
            button.innerHTML = 'Go!';
            button.onclick = function () {
                _this.loading = false;
                loader.style.display = 'none';
                _this.addAvatar();
                _this.startMaze();
            };
        };
        Mansion.prototype.handleResize = function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        Mansion.prototype.handleKeyUp = function (event) {
            if (this.avatar)
                this.avatar.visible = false;
        };
        Mansion.prototype.keyboardController = function (keys, repeat) {
            var _this = this;
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
                _this.handleKeyUp(event);
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
            // console.log("tick!", createjs.Ticker.getTime());
            this.stage.update();
            if (!event.paused) {
            }
        };
        return Mansion;
    })();
    Mansion_1.Mansion = Mansion;
})(Mansion || (Mansion = {}));
