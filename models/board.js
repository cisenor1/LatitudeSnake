"use strict";
var utilities_1 = require("../utilities/utilities");
var astar_1 = require("../javascript-astar-master/astar");
var Board = (function () {
    function Board(height, width) {
        this.turn = 0;
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
    Board.prototype.updateAStarBoard = function () {
        var weightedBoard = [];
        this.turn++;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (y == 0) {
                    weightedBoard[x] = [];
                }
                var cell = this.currentBoard[x][y];
                var weightedCell = void 0;
                if (cell.state == utilities_1.BoardCellContent.WALL || cell.snake) {
                    weightedCell = 0;
                }
                else {
                    weightedCell = 1;
                }
                weightedBoard[x][y] = weightedCell;
            }
        }
        this.astarBoard = new astar_1.Graph(weightedBoard);
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
        var thisSnakes = body.snakes.filter(function (s) { return s.id == _this.id; });
        var thisSnake = thisSnakes[0];
        this.head = thisSnake.coords[0];
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
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
        var out = null;
        for (var p in n) {
            if (n[p].state == utilities_1.BoardCellContent.FOOD) {
                out = p;
            }
        }
        return out;
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
        console.log("Valid Options:", validOptions);
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
    Board.prototype.getNextMove = function () {
        var food = this.getFoodNode();
        var head = this.getHeadNode();
        var out = astar_1.astar.search(this.astarBoard, head, food);
        var nextSpot = out[0];
        if (!nextSpot) {
            console.log("Found no valid path. Searching for open neighbor.");
            var secondTryDir = this.findClearNeighbor();
            if (!secondTryDir) {
                console.log("Still Nothing");
                return utilities_1.Directions.DOWN;
            }
            return secondTryDir;
        }
        var move = this.getDirectionFromGridElement(nextSpot.x, nextSpot.y);
        return move;
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
