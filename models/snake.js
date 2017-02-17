"use strict";
var Snake = (function () {
    function Snake() {
    }
    Snake.prototype.setContentBody = function (body) {
        var _this = this;
        this.id = body.you;
        var thisSnakes = body.snakes.filter(function (s) { return s.id == _this.id; });
        if (!thisSnakes.length) {
            throw new Error("NoSnake");
        }
        var thisSnake = thisSnakes[0];
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
    };
    return Snake;
}());
exports.Snake = Snake;
