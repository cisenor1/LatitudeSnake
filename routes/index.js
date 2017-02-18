"use strict";
var move_1 = require("./move");
var snake_1 = require("../models/snake");
var express = require("express");
var router = express.Router();
var config = require('../config.json');
var board;
// Handle GET request to '/'
router.get(config.routes.info, function (req, res) {
    // Response data 
    var data = {
        color: config.snake.color,
        head_url: config.snake.head_url
    };
    return res.json(data);
});
// Handle POST request to '/start'
router.post(config.routes.start, function (req, res) {
    // Do something here to start the game
    console.log(req.body.game_id);
    config.game_id = req.body.game_id;
    config.width = req.body.width;
    config.height = req.body.height;
    board = new snake_1.Snake(config.height, config.width);
    // Response data
    var data = {
        color: getRandomColor(),
        name: config.snake.name,
        taunt: config.snake.taunt.start,
        head_url: config.snake.head_url
    };
    return res.json(data);
});
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// Handle POST request to '/move'
router.post(config.routes.move, function (req, res) {
    // Do something here to generate your move
    // Response data 
    var data = {
        move: move_1.getMove(board, req.body),
        taunt: config.snake.taunt.move
    };
    console.log(data);
    return res.json(data);
});
// Handle POST request to '/end'
router.post(config.routes.end, function (req, res) {
    // Do something here to end your snake's session
    console.log("Ended");
    board = null;
    // We don't need a response so just send back a 200
    res.status(200);
    res.end();
    return;
});
module.exports = router;
