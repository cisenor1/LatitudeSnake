"use strict";
var utilities_1 = require("../utilities/utilities");
var javascript_astar_1 = require("javascript-astar");
var Board = (function () {
    function Board(height, width) {
        this.turn = 0;
        this.LOOPING_LENGTH = 1;
        this.avoidFood = false;
        this.UP = [0, -1];
        this.DOWN = [0, 1];
        this.LEFT = [-1, 0];
        this.RIGHT = [1, 0];
        this.UP_LEFT = [-1, -1];
        this.UP_RIGHT = [1, -1];
        this.DOWN_RIGHT = [1, 1];
        this.DOWN_LEFT = [-1, 1];
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
                if (cell.state == utilities_1.BoardCellContent.WALL || cell.snake || (avoidFood && cell.state == utilities_1.BoardCellContent.FOOD)) {
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
        if (point.x > this.width || point.x < 0 || point.y > this.height || point.y < 0) {
            throw new Error("Invalid grid space.");
        }
        this.currentBoard[point.x][point.y].state = state;
        this.currentBoard[point.x][point.y].snake = snake;
    };
    Board.prototype.addSnakesToBoard = function (snakes) {
        var _this = this;
        snakes.forEach(function (snake) {
            snake.coords.forEach(function (pt, i) {
                var p = { x: pt[0], y: pt[1] };
                if (i == 0) {
                    _this.setBoardCell(p, utilities_1.BoardCellContent.HEAD, snake.id);
                    return;
                }
                _this.setBoardCell(p, utilities_1.BoardCellContent.BODY, snake.id);
            });
        });
    };
    Board.prototype.addFoodToBoard = function (food) {
        var _this = this;
        this.foodList = food.map(function (f) { return { x: f[0], y: f[1] }; });
        this.foodList.forEach(function (f) {
            _this.setBoardCell(f, utilities_1.BoardCellContent.FOOD);
        });
    };
    Board.prototype.setContentBody = function (body) {
        var _this = this;
        this.clearBoard();
        this.addSnakesToBoard(body.snakes);
        this.addFoodToBoard(body.food);
        this.id = body.you;
        var allSnakes = body.snakes.filter(function (s) { return s.id == _this.id; });
        var thisSnake = allSnakes[0];
        this.head = { x: thisSnake.coords[0][0], y: thisSnake.coords[0][1] };
        this.coords = thisSnake.coords.map(function (c) { return { x: c[0], y: c[1] }; });
        this.health_points = thisSnake.health_points;
        this.otherSnake = body.snakes.filter(function (s) { return s.id != _this.id; })[0];
        this.otherSnake.head = { x: this.otherSnake.coords[0][0], y: this.otherSnake.coords[0][1] };
        this.updateAStarBoard();
    };
    Board.prototype.isItOnTheBoard = function (x, y) {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    };
    Board.prototype.getUp = function () {
        var x = this.head.x;
        var y = this.head.y - 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getDown = function () {
        var x = this.head.x;
        var y = this.head.y + 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getLeft = function () {
        var x = this.head.x - 1;
        var y = this.head.y;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getRight = function () {
        var x = this.head.x + 1;
        var y = this.head.y;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    };
    // getNeighbors(): OneSpaceNeighbors {
    //     return {
    //         up: this.getUp(),
    //         down: this.getDown(),
    //         left: this.getLeft(),
    //         right: this.getRight()
    //     }
    // }
    // neighboringFood(): string {
    //     let n = this.getNeighbors();
    //     let ourDirections = null;
    //     for (let p in n) {
    //         if (n[p].state == BoardCellContent.FOOD) {
    //             ourDirections = p;
    //         }
    //     }
    //     return ourDirections;
    // }
    // moveTowardsFood(dodge = false) {
    //     let food = this.foodList[0];
    //     if (!food) {
    //         return Directions.random();
    //     }
    //     let hor = food[0] - this.head[0];
    //     let vert = food[1] - this.head[1];
    //     if (hor > 0) {
    //         return Directions.RIGHT;
    //     }
    //     if (hor < 0) {
    //         return Directions.LEFT;
    //     }
    //     if (vert < 0) {
    //         return Directions.UP;
    //     }
    //     if (vert > 0) {
    //         return Directions.DOWN;
    //     }
    // }
    // findClearNeighbor(): string {
    //     let n = this.getNeighbors();
    //     let validOptions = [];
    //     for (var p in Directions) {
    //         let dir = n[p.toLocaleLowerCase()];
    //         if (!dir) {
    //             continue;
    //         }
    //         if (dir.state != BoardCellContent.EMPTY && dir.state != BoardCellContent.FOOD) {
    //             continue;
    //         }
    //         validOptions.push(p.toLocaleLowerCase());
    //     }
    //     let opt;
    //     //console.log("Valid Options:", validOptions);
    //     if (!validOptions.length) {
    //         opt = Directions.DOWN;
    //     } else {
    //         opt = validOptions[Math.floor(Math.random() * validOptions.length)];
    //     }
    //     return opt;
    // }
    Board.prototype.getNode = function (dir) {
        var headX = this.head.x;
        var headY = this.head.y;
        var mod;
        switch (dir) {
            case utilities_1.Directions.UP:
                mod = this.UP;
            case utilities_1.Directions.DOWN:
                mod = this.DOWN;
            case utilities_1.Directions.LEFT:
                mod = this.LEFT;
            case utilities_1.Directions.RIGHT:
                mod = this.RIGHT;
            case utilities_1.Directions.UP_LEFT:
                mod = this.UP_LEFT;
            case utilities_1.Directions.UP_RIGHT:
                mod = this.UP_RIGHT;
            case utilities_1.Directions.DOWN_LEFT:
                mod = this.DOWN_LEFT;
            case utilities_1.Directions.DOWN_RIGHT:
                mod = this.DOWN_RIGHT;
        }
        return this.astarBoard.grid[headX + mod[0]][headY + mod[1]];
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
        var ourDirections = javascript_astar_1.astar.search(this.astarBoard, head, food);
        var theirDirections = javascript_astar_1.astar.search(this.astarBoard, enemy, food);
        if (this.areWeCloser(ourDirections, theirDirections)) {
            // console.log("We're closer");
            var newPath = this.shouldWeLoop(ourDirections, theirDirections);
            if (newPath) {
                // console.log("Planning on looping: ", newPath, theirDirections);
                if (newPath.length == 0) {
                    console.log("MOM! WERE LOOPING!");
                    return this.doALoopDeLoop();
                }
                console.log("New Path:");
                return this.getOldMove(newPath);
            }
            return this.getOldMove(ourDirections);
        }
        else {
            console.log("ShouldNotFood");
            return this.getOldMove(ourDirections);
        }
    };
    Board.prototype.getEmptyLeftOrRight = function () {
        if (this.getLeft().state == utilities_1.BoardCellContent.EMPTY) {
            return "left";
        }
        return "right";
    };
    Board.prototype.getEmptyUpOrDown = function () {
        if (this.getUp().state == utilities_1.BoardCellContent.EMPTY) {
            return "up";
        }
        return "down";
    };
    Board.prototype.doALoopDeLoop = function () {
        var foodLocation = this.getFoodNode();
        if (foodLocation.x == this.head.x) {
            return this.getEmptyLeftOrRight();
        }
        else if (foodLocation.y == this.head.y) {
            return this.getEmptyUpOrDown();
        }
        else {
            // it's diagonal
            if (foodLocation.x > this.head.x) {
                // it's right
                if (foodLocation.y > this.head.y) {
                    // it's down-right
                    if (this.getDown().state == utilities_1.BoardCellContent.EMPTY) {
                        return utilities_1.Directions.DOWN;
                    }
                    else {
                        return utilities_1.Directions.RIGHT;
                    }
                }
                else {
                    // it's up-right
                    if (this.getUp().state == utilities_1.BoardCellContent.EMPTY) {
                        return utilities_1.Directions.UP;
                    }
                    else {
                        return utilities_1.Directions.RIGHT;
                    }
                }
            }
            else {
                // it's left
                if (foodLocation.y > this.head.y) {
                    // it's down-left
                    if (this.getDown().state == utilities_1.BoardCellContent.EMPTY) {
                        return utilities_1.Directions.DOWN;
                    }
                    else {
                        return utilities_1.Directions.LEFT;
                    }
                }
                else {
                    // it's up-left
                    if (this.getUp().state == utilities_1.BoardCellContent.EMPTY) {
                        return utilities_1.Directions.UP;
                    }
                    else {
                        return utilities_1.Directions.LEFT;
                    }
                }
            }
        }
    };
    Board.prototype.isOnBorder = function (inCoords) {
        var x = inCoords.x;
        var y = inCoords.y;
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
            console.log("We're not long enough.");
            return false;
        }
        var food = this.foodList[0];
        if (this.health_points < this.otherSnake.health_points) {
            console.log("They're Stronger");
            return false;
        }
        var head = this.getHeadNode();
        if (!theirDirections.length) {
            var tail = this.getOurTail();
            return javascript_astar_1.astar.search(this.astarBoard, head, tail);
        }
        if (this.isOnBorder(food)) {
            console.log("Food's on a border.");
            return false;
        }
        var theirShortPath = this.getGridEntryPoint(theirDirections);
        // this.updateAStarBoard(true);
        //this.astarBoard.grid[food.x][food.y].weight = 0;
        //console.log(theirShortPath); 
        var theirEntryPoint = theirShortPath[theirShortPath.length - 1];
        return javascript_astar_1.astar.search(this.astarBoard, head, theirEntryPoint);
    };
    Board.prototype.getGridEntryPoint = function (theirAStarPath) {
        //console.log(theirAStarPath.grid);
        var lastItem = theirAStarPath.length - 2; // because we don't care about food.
        while (this.isInGrid(theirAStarPath[lastItem]) && lastItem >= 0) {
            lastItem--;
        }
        return theirAStarPath.slice(0, lastItem + 2); // theirAStarPath[lastItem + 1];
    };
    Board.prototype.isInGrid = function (target) {
        if (!target) {
            return false;
        }
        var food = this.foodList[0];
        return Math.abs(food.x - target.x) <= 1 && Math.abs(food.y - target.y) <= 1;
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
        }
        var move = this.getDirectionFromGridElement(nextSpot);
        return move;
    };
    Board.prototype.getEnemyHead = function () {
        if (!this.otherSnake) {
            return null;
        }
        var headX = this.otherSnake.head.x;
        var headY = this.otherSnake.head.y;
        return this.astarBoard.grid[headX][headY];
    };
    Board.prototype.getFoodNode = function () {
        var foodX = this.foodList[0].x;
        var foodY = this.foodList[0].y;
        return this.astarBoard.grid[foodX][foodY];
    };
    Board.prototype.getOurTail = function () {
        var tailCoords = this.coords[this.coords.length - 1];
        var tx = tailCoords.x;
        var ty = tailCoords.y;
        return this.astarBoard.grid[tx][ty];
    };
    Board.prototype.getHeadNode = function () {
        var headX = this.head.x;
        var headY = this.head.y;
        return this.astarBoard.grid[headX][headY];
    };
    Board.prototype.getDirectionFromGridElement = function (inPoint) {
        var xdif = inPoint.x - this.head.x;
        var ydif = inPoint.y - this.head.y;
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
