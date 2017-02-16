"use strict";
var utilities_1 = require("../utilities/utilities");
function getMove(body) {
    console.log(body.snakes);
    return utilities_1.Directions.random();
}
exports.getMove = getMove;
