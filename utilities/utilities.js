"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BetterError = (function (_super) {
    __extends(BetterError, _super);
    function BetterError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BetterError;
}(Error));
exports.BetterError = BetterError;
var Directions = (function () {
    function Directions() {
    }
    Directions.random = function () {
        var r = (Math.floor(Math.random() * 10) % 4);
        console.log(this.allDirs[r]);
        return this.allDirs[r];
    };
    return Directions;
}());
Directions.UP = "up";
Directions.DOWN = "down";
Directions.LEFT = "left";
Directions.RIGHT = "right";
Directions.UP_RIGHT = "upright";
Directions.DOWN_RIGHT = "downright";
Directions.UP_LEFT = "upleft";
Directions.DOWN_LEFT = "downleft";
Directions.allDirs = [
    Directions.UP,
    Directions.DOWN,
    Directions.LEFT,
    Directions.RIGHT
];
exports.Directions = Directions;
/** All possible contents of a Board Cell */
var BoardCellContent = (function () {
    function BoardCellContent() {
    }
    return BoardCellContent;
}());
BoardCellContent.HEAD = "head";
BoardCellContent.BODY = "body";
BoardCellContent.FOOD = "food";
BoardCellContent.EMPTY = "empty";
BoardCellContent.WALL = "wall";
exports.BoardCellContent = BoardCellContent;
