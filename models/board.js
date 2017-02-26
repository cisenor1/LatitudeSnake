"use strict";
var utilities_1 = require("../utilities/utilities");
var javascript_astar_1 = require("javascript-astar");
var Board = (function () {
    function Board(height, width) {
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
        this.astarBoard = new javascript_astar_1.Graph(weightedBoard);
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
        // console.log("Finished Body",thisSnake);
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
        if (!validOptions.length) {
            console.log("Found Nothing! ");
            return "down";
        }
        if (validOptions.length == 1) {
            var opt_1 = validOptions[0];
            console.log("No choice, going ", opt_1);
            return opt_1;
        }
        console.log(validOptions);
        var opt = validOptions[Math.floor(Math.random() * validOptions.length)];
        console.log("Picked ", opt, " at random");
        return opt;
    };
    Board.prototype.getNextMove = function () {
        var food = this.getFoodNode();
        var head = this.getHeadNode();
        var out = javascript_astar_1.astar.search(this.astarBoard, head, food);
        if (!out.length) {
            console.log(out);
            throw new Error("No path");
        }
        var nextSpot = out[0];
        var move = this.getDirectionFromGridElement(nextSpot.x, nextSpot.y);
        return move;
    };
    Board.prototype.getFoodNode = function () {
        var foodX = this.foodList[0][0];
        var foodY = this.foodList[0][1];
        console.log("Getting Food:", foodX, foodY, this.astarBoard);
        return this.astarBoard.grid[foodX][foodY];
    };
    Board.prototype.getHeadNode = function () {
        var headX = this.head[0];
        var headY = this.head[1];
        console.log("Getting Head:", headX, headY, this.astarBoard);
        return this.astarBoard.grid[headX][headY];
    };
    Board.prototype.getDirectionFromGridElement = function (x, y) {
        var headx = this.head[0];
        var heady = this.head[1];
        var xdif = x - headx;
        var ydif = y - heady;
        var absX = Math.abs(xdif);
        var absY = Math.abs(ydif);
        console.log(headx, heady, xdif, ydif, absX, absY);
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
