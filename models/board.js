"use strict";
var utilities_1 = require("../utilities/utilities");
var javascript_astar_master_1 = require("javascript-astar-master");
var Board = (function () {
    function Board(height, width) {
        this.turn = 0;
        this.LOOPING_LENGTH = 1;
        this.avoidFood = false;
        this.UP = [0, -1];
        this.DOWN = [0, 1];
        this.LEFT = [-1, 0];
        this.RIGHT = [1, 0];
        this.height = height;
        this.width = width;
        this.initBoard();
    }
    Board.prototype.initBoard = function () {
        this.currentBoard = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (y == 0) {
                    this.currentBoard[x] = [];
                }
                this.currentBoard[x][y] = {
                    state: utilities_1.BoardCellContent.EMPTY
                };
            }
        }
    };
    Board.prototype.updateAStarBoard = function (avoidFood) {
        if (avoidFood === void 0) { avoidFood = false; }
        var weightedBoard = [];
        this.turn++;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (y == 0) {
                    weightedBoard[x] = [];
                }
                var cell = this.currentBoard[x][y];
                var weightedCell = void 0;
                if (cell.state == utilities_1.BoardCellContent.WALL || cell.snake || (avoidFood && x == this.foodList[0][0] && y == this.foodList[0][1])) {
                    weightedCell = 0;
                }
                else {
                    weightedCell = 1;
                }
                weightedBoard[x][y] = weightedCell;
            }
        }
        this.astarBoard = new javascript_astar_master_1.Graph(weightedBoard);
    };
    Board.prototype.clearBoard = function () {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.currentBoard[x][y] = {
                    state: utilities_1.BoardCellContent.EMPTY
                };
            }
        }
    };
    Board.prototype.setBoardCell = function (point, state, snake) {
        if (point[0] > this.width || point[0] < 0 || point[1] > this.height || point[1] < 0) {
            throw new Error("Invalid grid space.");
        }
        this.currentBoard[point[0]][point[1]].state = state;
        this.currentBoard[point[0]][point[1]].snake = snake;
    };
    Board.prototype.addSnakesToBoard = function (snakes) {
        var _this = this;
        snakes.forEach(function (snake) {
            snake.coords.forEach(function (pt, i) {
                if (i == 0) {
                    _this.setBoardCell(pt, utilities_1.BoardCellContent.HEAD, snake.id);
                    return;
                }
                _this.setBoardCell(pt, utilities_1.BoardCellContent.BODY, snake.id);
            });
        });
    };
    Board.prototype.addFoodToBoard = function (food) {
        var _this = this;
        this.foodList = food;
        food.forEach(function (f) {
            _this.setBoardCell(f, utilities_1.BoardCellContent.FOOD);
        });
    };
    Board.prototype.setContentBody = function (body) {
        var _this = this;
        this.clearBoard();
        var snakes = body.snakes;
        this.addSnakesToBoard(snakes);
        this.addFoodToBoard(body.food);
        this.id = body.you;
        var allSnakes = body.snakes.filter(function (s) { return s.id == _this.id; });
        var thisSnake = allSnakes[0];
        this.head = thisSnake.coords[0];
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
        this.otherSnake = body.snakes.filter(function (s) { return s.id != _this.id; })[0];
        this.otherSnake.head = this.otherSnake.coords[0];
        this.updateAStarBoard();
    };
    Board.prototype.isItOnTheBoard = function (x, y) {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    };
    Board.prototype.getUp = function () {
        var x = this.head[0];
        var y = this.head[1] - 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getDown = function () {
        var x = this.head[0];
        var y = this.head[1] + 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getLeft = function () {
        var x = this.head[0] - 1;
        var y = this.head[1];
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getRight = function () {
        var x = this.head[0] + 1;
        var y = this.head[1];
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getNeighbors = function () {
        return {
            up: this.getUp(),
            down: this.getDown(),
            left: this.getLeft(),
            right: this.getRight()
        };
    };
    Board.prototype.neighboringFood = function () {
        var n = this.getNeighbors();
        var ourDirections = null;
        for (var p in n) {
            if (n[p].state == utilities_1.BoardCellContent.FOOD) {
                ourDirections = p;
            }
        }
        return ourDirections;
    };
    Board.prototype.moveTowardsFood = function (dodge) {
        if (dodge === void 0) { dodge = false; }
        var food = this.foodList[0];
        if (!food) {
            return utilities_1.Directions.random();
        }
        var hor = food[0] - this.head[0];
        var vert = food[1] - this.head[1];
        if (hor > 0) {
            return utilities_1.Directions.RIGHT;
        }
        if (hor < 0) {
            return utilities_1.Directions.LEFT;
        }
        if (vert < 0) {
            return utilities_1.Directions.UP;
        }
        if (vert > 0) {
            return utilities_1.Directions.DOWN;
        }
    };
    Board.prototype.findClearNeighbor = function () {
        var n = this.getNeighbors();
        var validOptions = [];
        for (var p in utilities_1.Directions) {
            var dir = n[p.toLocaleLowerCase()];
            if (!dir) {
                continue;
            }
            if (dir.state != utilities_1.BoardCellContent.EMPTY && dir.state != utilities_1.BoardCellContent.FOOD) {
                continue;
            }
            validOptions.push(p.toLocaleLowerCase());
        }
        var opt;
        //console.log("Valid Options:", validOptions);
        if (!validOptions.length) {
            opt = utilities_1.Directions.DOWN;
        }
        else {
            opt = validOptions[Math.floor(Math.random() * validOptions.length)];
        }
        return opt;
    };
    Board.prototype.getNode = function (dir) {
        var headX = this.head[0];
        var headY = this.head[1];
        switch (dir) {
            case utilities_1.Directions.UP:
                return [
                    headX + this.UP[0],
                    headY + this.UP[1]
                ];
            case utilities_1.Directions.DOWN:
                return [
                    headX + this.DOWN[0],
                    headY + this.DOWN[1]
                ];
            case utilities_1.Directions.LEFT:
                return [
                    headX + this.LEFT[0],
                    headY + this.LEFT[1]
                ];
            case utilities_1.Directions.RIGHT:
                return [
                    headX + this.RIGHT[0],
                    headY + this.RIGHT[1]
                ];
        }
    };
    Board.prototype.weGotLastFood = function () {
        return;
    };
    /*
        get their head.
        who gets the next food.
        if us, determine if we should loop, or eat
            if we got the last food: yes // our health > their health
            if (canCircle)    // not on edge, this.len  > loopleng
                loop
        if Looping,
            how for to do loop:
                get food location,
                build a grid around it,
                if our leng < 9, hug 1 square radius


    */
    Board.prototype.getNextMove = function () {
        var food = this.getFoodNode();
        var head = this.getHeadNode();
        var enemy = this.getEnemyHead();
        var ourDirections = javascript_astar_master_1.astar.search(this.astarBoard, head, food);
        var theirDirections = javascript_astar_master_1.astar.search(this.astarBoard, enemy, food);
        if (this.areWeCloser(ourDirections, theirDirections)) {
            var newPath = this.shouldWeLoop(ourDirections, theirDirections);
            if (newPath) {
                console.log("Planning on looping: " + newPath.length.toString());
                if (newPath.length == 0) {
                    console.log("MOM! WERE LOOPING!");
                }
                this.getOldMove(newPath);
            }
            return this.getOldMove(ourDirections);
        }
        else {
            //console.log("ShouldNotFood");
            return this.getOldMove(ourDirections);
        }
    };
    Board.prototype.isOnBorder = function (inCoords) {
        var x = inCoords[0];
        var y = inCoords[1];
        if (x == this.width - 1 || x == 0) {
            return true;
        }
        if (y == this.height - 1 || y == 0) {
            return true;
        }
        return false;
    };
    Board.prototype.shouldWeLoop = function (ourDirections, theirDirections) {
        if (this.coords.length < this.LOOPING_LENGTH) {
            return false;
        }
        var food = this.foodList[0];
        if (this.health_points < this.otherSnake.health_points) {
            return false;
        }
        if (this.isOnBorder(food)) {
            return false;
        }
        var theirShortPath = this.getGridEntryPoint(theirDirections);
        this.updateAStarBoard(true);
        //this.astarBoard.grid[food[0]][food[1]].weight = 0;
        //console.log(theirShortPath);
        //console.log(theirShortPath[theirShortPath.length - 1]);
        var newPath = javascript_astar_master_1.astar.search(this.astarBoard, this.getHeadNode(), theirShortPath[theirShortPath.length - 1]);
        var wereCloser = this.areWeCloser(newPath, theirShortPath);
        if (!wereCloser) {
            return false;
        }
        return newPath;
    };
    Board.prototype.getGridEntryPoint = function (theirAStarPath) {
        var food = this.foodList[0];
        //console.log(theirAStarPath.grid);
        var lastItem = theirAStarPath.length - 2; // because we don't care about food.
        while (this.isInGrid(theirAStarPath[lastItem]) && lastItem >= 0) {
            lastItem--;
        }
        return theirAStarPath.slice(0, lastItem + 2); // theirAStarPath[lastItem + 1];
    };
    Board.prototype.isInGrid = function (target) {
        var food = this.foodList[0];
        return Math.abs(food[0] - target.x) <= 1 && Math.abs(food[1] - target.y) <= 1;
    };
    Board.prototype.areWeCloser = function (us, them) {
        if (!them.length) {
            return true;
        }
        return us.length < them.length;
    };
    Board.prototype.getOldMove = function (ourDirections) {
        var nextSpot = ourDirections[0];
        if (!nextSpot) {
            // Stall method extremely unlikely.
            //console.log("Found no valid path. Searching for open neighbor.");
            var secondTryDir = this.findClearNeighbor();
            if (!secondTryDir) {
                //console.log("Still Nothing");
                return utilities_1.Directions.DOWN;
            }
            return secondTryDir;
        }
        var move = this.getDirectionFromGridElement(nextSpot.x, nextSpot.y);
        return move;
    };
    Board.prototype.getEnemyHead = function () {
        if (!this.otherSnake) {
            return null;
        }
        var headX = this.otherSnake.head[0];
        var headY = this.otherSnake.head[1];
        return this.astarBoard.grid[headX][headY];
    };
    Board.prototype.getFoodNode = function () {
        var foodX = this.foodList[0][0];
        var foodY = this.foodList[0][1];
        return this.astarBoard.grid[foodX][foodY];
    };
    Board.prototype.getHeadNode = function () {
        var headX = this.head[0];
        var headY = this.head[1];
        return this.astarBoard.grid[headX][headY];
    };
    Board.prototype.getDirectionFromGridElement = function (x, y) {
        var headx = this.head[0];
        var heady = this.head[1];
        var xdif = x - headx;
        var ydif = y - heady;
        var absX = Math.abs(xdif);
        var absY = Math.abs(ydif);
        if (xdif == 0) {
            if (ydif == 0) {
                throw new Error("Food cannot be on your head!");
            }
            if (ydif < 0) {
                return utilities_1.Directions.UP;
            }
            else if (ydif > 0) {
                return utilities_1.Directions.DOWN;
            }
        }
        else if (ydif == 0) {
            if (xdif == 0) {
                throw new Error("Food cannot be on your head!");
            }
            if (xdif < 0) {
                return utilities_1.Directions.LEFT;
            }
            else if (xdif > 0) {
                return utilities_1.Directions.RIGHT;
            }
        }
        else if (xdif > 0) {
            return utilities_1.Directions.RIGHT;
        }
        else if (xdif < 0) {
            return utilities_1.Directions.LEFT;
        }
    };
    return Board;
}());
exports.Board = Board;
