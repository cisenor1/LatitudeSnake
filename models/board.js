"use strict";
var utilities_1 = require("../utilities/utilities");
var javascript_astar_master_1 = require("javascript-astar-master");
var Board = (function () {
    function Board(height, width, loopingLength, planningNumber) {
        this.turn = 0;
        this.LOOPING_LENGTH = 8;
        this.PLANNING_LENGTH = 1;
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
        this.PLANNING_LENGTH = planningNumber;
        this.LOOPING_LENGTH = loopingLength;
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
                    state: utilities_1.BoardCellContent.EMPTY,
                    x: x,
                    y: y
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
        this.astarBoard = new javascript_astar_master_1.Graph(weightedBoard);
    };
    Board.prototype.clearBoard = function () {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.currentBoard[x][y] = {
                    state: utilities_1.BoardCellContent.EMPTY,
                    x: x,
                    y: y
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
        if (this.otherSnake) {
            this.otherSnake.head = { x: this.otherSnake.coords[0][0], y: this.otherSnake.coords[0][1] };
        }
        this.updateAStarBoard();
    };
    Board.prototype.isItOnTheBoard = function (x, y) {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    };
    Board.prototype.getUp = function () {
        var x = this.head.x;
        var y = this.head.y - 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getDown = function () {
        var x = this.head.x;
        var y = this.head.y + 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getLeft = function () {
        var x = this.head.x - 1;
        var y = this.head.y;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.getRight = function () {
        var x = this.head.x + 1;
        var y = this.head.y;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: utilities_1.BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    };
    Board.prototype.cellIsOurTail = function (cell) {
        var ourTail = this.coords[this.coords.length - 1];
        var itsOurTail = ourTail.x == cell.x && ourTail.y == cell.y;
        return itsOurTail;
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
    Board.prototype.foodIsNeighbor = function () {
        if (this.getUp().state == utilities_1.BoardCellContent.FOOD || this.getDown().state == utilities_1.BoardCellContent.FOOD || this.getLeft().state == utilities_1.BoardCellContent.FOOD || this.getRight().state == utilities_1.BoardCellContent.FOOD) {
            return true;
        }
        if (this.foodIsDiagonal()) {
            return true;
        }
        return false;
    };
    Board.prototype.gridNodeHasFood = function (pt) {
        if (pt.x < 0 || pt.x >= this.width || pt.y < 0 || pt.y >= this.height) {
            return false;
        }
        return this.currentBoard[pt.x][pt.y].state == utilities_1.BoardCellContent.FOOD;
    };
    Board.prototype.foodIsDiagonal = function () {
        var ul = this.gridNodeHasFood({ x: this.head.x + this.UP_LEFT[0], y: this.head.y + this.UP_LEFT[1] });
        var dl = this.gridNodeHasFood({ x: this.head.x + this.DOWN_LEFT[0], y: this.head.y + this.DOWN_LEFT[1] });
        var ur = this.gridNodeHasFood({ x: this.head.x + this.UP_RIGHT[0], y: this.head.y + this.UP_RIGHT[1] });
        var dr = this.gridNodeHasFood({ x: this.head.x + this.DOWN_RIGHT[0], y: this.head.y + this.DOWN_RIGHT[1] });
        return ul || dl || ur || dr;
    };
    Board.prototype.getQuadrant = function (point) {
        var quadrant = 0;
        if (point.x < this.width / 2) {
        }
        else {
            //right
            quadrant++;
        }
        if (point.y < this.height / 2) {
        }
        else {
            //down
            quadrant += 2;
        }
        return quadrant;
    };
    Board.prototype.getQuadrantPoint = function (quadrant) {
        switch (quadrant) {
            case 0:
                return { x: Math.floor(this.width / 4), y: Math.floor(this.height / 4) };
            case 1:
                return { x: Math.floor(this.width * 3 / 4), y: Math.floor(this.height / 4) };
            case 2:
                return { x: Math.floor(this.width / 4), y: Math.floor(this.height * 3 / 4) };
            case 3:
                return { x: Math.floor(this.width * 3 / 4), y: Math.floor(this.height * 3 / 4) };
        }
    };
    Board.prototype.getOtherQuadrant = function () {
        var food = this.foodList[0];
        var foodQuadrant = this.getQuadrant(food);
        var ourQuadrant = this.getQuadrant(this.head);
        var remainingQuadrants = [0, 1, 2, 3].filter(function (x) { return x != ourQuadrant && x != foodQuadrant; });
        var targetIndex = Math.floor(Math.random() * remainingQuadrants.length);
        var targetQuadrant = remainingQuadrants[targetIndex];
        return this.getQuadrantPoint(targetQuadrant);
    };
    Board.prototype.shouldNotFood = function () {
        var destination = this.getOtherQuadrant();
        var dNode = this.astarBoard.grid[destination.x][destination.y];
        var notFoodDirections = javascript_astar_master_1.astar.search(this.astarBoard, this.getHeadNode(), dNode);
        return this.getOldMove(notFoodDirections);
    };
    Board.prototype.getNextMove = function () {
        var food = this.getFoodNode();
        var head = this.getHeadNode();
        var enemy = this.getEnemyHead();
        var ourDirections = javascript_astar_master_1.astar.search(this.astarBoard, head, food);
        var theirDirections = [];
        if (enemy) {
            theirDirections = javascript_astar_master_1.astar.search(this.astarBoard, enemy, food);
        }
        if (this.areWeCloser(ourDirections, theirDirections)) {
            var newPath = this.shouldWeLoop(ourDirections, theirDirections);
            if (newPath) {
                if (this.foodIsNeighbor()) {
                    return this.doALoopDeLoop();
                }
                return this.getOldMove(newPath);
            }
            return this.getOldMove(ourDirections);
        }
        else {
            return this.shouldNotFood();
        }
    };
    Board.prototype.getEmptyLeftOrRight = function () {
        var cell = this.getLeft();
        if (cell.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
            return utilities_1.Directions.LEFT;
        }
        return utilities_1.Directions.RIGHT;
    };
    Board.prototype.getEmptyUpOrDown = function () {
        var cell = this.getUp();
        if (cell.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
            return utilities_1.Directions.UP;
        }
        return utilities_1.Directions.DOWN;
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
                    var down = this.getDown();
                    var right = this.getRight();
                    // it's down-right
                    if (down.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(down)) {
                        return utilities_1.Directions.DOWN;
                    }
                    else if (right.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(right)) {
                        return utilities_1.Directions.RIGHT;
                    }
                }
                else {
                    var up = this.getUp();
                    var right = this.getRight();
                    // it's up-right
                    if (up.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(up)) {
                        return utilities_1.Directions.UP;
                    }
                    else if (right.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(right)) {
                        return utilities_1.Directions.RIGHT;
                    }
                }
            }
            else {
                // it's left
                if (foodLocation.y > this.head.y) {
                    var cell = this.getDown();
                    // it's down-left 
                    if (cell.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
                        return utilities_1.Directions.DOWN;
                    }
                    else {
                        return utilities_1.Directions.LEFT;
                    }
                }
                else {
                    var cell = this.getUp();
                    // it's up-left
                    if (cell.state == utilities_1.BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
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
            return false;
        }
        if (this.otherSnake && this.health_points < this.otherSnake.health_points) {
            return false;
        }
        var food = this.foodList[0];
        if (this.isOnBorder(food)) {
            return false;
        }
        var head = this.getHeadNode();
        if (!theirDirections.length) {
            return javascript_astar_master_1.astar.search(this.astarBoard, head, this.getFoodNode());
        }
        var theirShortPath = this.getGridEntryPoint(theirDirections);
        // this.updateAStarBoard(true);
        //this.astarBoard.grid[food.x][food.y].weight = 0; 
        var theirEntryPoint = theirShortPath[theirShortPath.length - 1];
        return javascript_astar_master_1.astar.search(this.astarBoard, head, theirEntryPoint);
    };
    Board.prototype.getGridEntryPoint = function (theirAStarPath) {
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
        if (this.otherSnake && this.otherSnake.health_points > this.health_points) {
            return true;
        }
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
