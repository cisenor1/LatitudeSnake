import { getMove } from "./move";
import { Board } from "../models/board";
import * as  express from 'express';
declare var require, module;
var router = express.Router();
var config = require('../config.json');
var board; 
// Handle GET request to '/'
router.get(config.routes.info, function (req, res) {
  // Response data 
  var data = {
    color: config.snake.color,
    head_url: config.snake.head_url,
    head_type: config.snake.head_type,
    tail_type: config.snake.tail_type
  };
  return res.json(data);
});

// Handle POST request to '/start'
router.post(config.routes.start, function (req, res) {
  // Do something here to start the game 
  config.game_id = req.body.game_id;
  config.width = req.body.width;
  config.height = req.body.height;
  board = new Board(config.height, config.width, config.loopingLength, config.planningDistance,config.numberOfSquaresToLoop); 
  // Response data
  var data = {
    color: config.snake.color,
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
  try {
  let taunt;
  if (board.turn < 100){
    taunt = config.snake.taunt.move["0"];
  }else if (board.turn < 250){
    taunt = config.snake.taunt.move["100"];
  }else if (board.turn < 500){
    taunt = config.snake.taunt.move["250"];
  }else if (board.turn >= 500){
    taunt = config.snake.taunt.move["500"];
  }
    var data = {
      move: getMove(board, req.body), // one of: ["north", "east", "south", "west"]
      taunt: taunt
    }; 
    return res.json(data);
  } catch (err) {
    console.log(err, board.id, board.turn);
  }
});

// Handle POST request to '/end'
router.post(config.routes.end, function (req, res) {
  // Do something here to end your snake's session
  console.log("Ended at turn:", board.turn);
  board = null;
  // We don't need a response so just send back a 200
  res.status(200);
  res.end();
  return;
});


module.exports = router;
