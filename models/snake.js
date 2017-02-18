"use strict";
var utilities_1 = require("../utilities/utilities");
var Snake = (function () {
    function Snake(height, width) {
        console.log("In constructor. h:" + height + ", w: " + width);
        this.height = height;
        this.width = width;
        this.initBoard();
    }
    Snake.prototype.initBoard = function () {
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
    Snake.prototype.clearBoard = function () {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.currentBoard[x][y] = {
                    state: utilities_1.BoardCellContent.EMPTY
                };
            }
        }
    };
    Snake.prototype.setBoardCell = function (point, state, snake) {
        if (point[0] > this.width || point[0] < 0 || point[1] > this.height || point[1] < 0) {
            throw new Error("Invalid grid space.");
        }
        this.currentBoard[point[0]][point[1]].state = state;
        this.currentBoard[point[0]][point[1]].snake = snake;
    };
    Snake.prototype.addSnakesToBoard = function (snakes) {
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
    Snake.prototype.addFoodToBoard = function (food) {
        var _this = this;
        this.food = food;
        food.forEach(function (f) {
            _this.setBoardCell(f, utilities_1.BoardCellContent.FOOD);
        });
    };
    Snake.prototype.drawBoard = function () {
        console.log("Drawing:");
        var out = "";
        for (var x = 0; x < this.height; x++) {
            for (var y = 0; y < this.height; y++) {
                var state = this.currentBoard[y][x].state;
                if (state == utilities_1.BoardCellContent.EMPTY) {
                    state = " ";
                }
                out += state.charAt(0);
            }
            out += "\n";
        }
        console.log(out);
    };
    Snake.prototype.setContentBody = function (body) {
        var _this = this;
        this.clearBoard();
        var snakes = body.snakes;
        this.addSnakesToBoard(snakes);
        this.addFoodToBoard(body.food);
        // this.drawBoard();
        this.id = body.you;
        var thisSnakes = body.snakes.filter(function (s) { return s.id == _this.id; });
        if (!thisSnakes.length) {
            throw new Error("NoSnake");
        }
        var thisSnake = thisSnakes[0];
        this.head = thisSnake.coords[0];
        // console.log("Finished Body",thisSnake);
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
    };
    Snake.prototype.isItOnTheBoard = function (x, y) {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    };
    Snake.prototype.getUp = function () {
        var x = this.head[0];
        var y = this.head[1] - 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Snake.prototype.getDown = function () {
        var x = this.head[0];
        var y = this.head[1] + 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Snake.prototype.getLeft = function () {
        var x = this.head[0] - 1;
        var y = this.head[1];
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Snake.prototype.getRight = function () {
        var x = this.head[0] + 1;
        var y = this.head[1];
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Snake.prototype.getNeighbors = function () {
        return {
            up: this.getUp(),
            down: this.getDown(),
            left: this.getLeft(),
            right: this.getRight()
        };
    };
    Snake.prototype.neighboringFood = function () {
        var n = this.getNeighbors();
        var out = null;
        for (var p in n) {
            if (n[p].state == utilities_1.BoardCellContent.FOOD) {
                out = p;
            }
        }
        return out;
    };
    Snake.prototype.moveTowardsFood = function (dodge) {
        if (dodge === void 0) { dodge = false; }
        var food = this.food[0];
        if (!food) {
            return utilities_1.Directions.random();
        }
        var hor = food[0] - this.head[0];
        var vert = food[1] - this.head[1];
        console.log(hor, vert);
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
    Snake.prototype.findClearNeighbor = function () {
        var n = this.getNeighbors();
        console.log("Neighbor Object is ", n);
        for (var p in utilities_1.Directions) {
            var dir = n[p.toLocaleLowerCase()];
            console.log(p.toLocaleLowerCase());
            console.log("In findClearNeighbor, ", dir);
            if (!dir) {
                continue;
            }
            if (dir.state != utilities_1.BoardCellContent.EMPTY && dir.state != utilities_1.BoardCellContent.FOOD) {
                continue;
            }
            console.log("Was blocked, used ", p);
            return p.toLocaleLowerCase();
        }
        console.log("Found Nothing! ");
    };
    Snake.prototype.getNextMove = function () {
        if (this.neighboringFood()) {
            return this.neighboringFood();
        }
        var move = this.moveTowardsFood();
        var target = this.getNeighbors()[move];
        if (target.state != utilities_1.BoardCellContent.EMPTY && target.state != utilities_1.BoardCellContent.FOOD) {
            return this.findClearNeighbor();
        }
        return move;
    };
    return Snake;
}());
exports.Snake = Snake;
