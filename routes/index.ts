import {getMove} from "./move";
import * as  express from 'express';
var router  = express.Router();
var config  = require('../config.json');

// Handle GET request to '/'
router.get(config.routes.info, function (req, res) {
  // Response data
  console.log("Get /")
  var data = {
    color: config.snake.color,
    head_url: config.snake.head_url
  };
  console.log(data);

  return res.json(data);
});

// Handle POST request to '/start'
router.post(config.routes.start, function (req, res) {
  // Do something here to start the game
  console.log(req.body.game_id)
  config.game_id = req.body.game_id;
  config.width = req.body.width;
  config.height = req.body.height;
  // Response data
  var data = {
    color: config.snake.color,
    name: config.snake.name,
    taunt: config.snake.taunt.start,
    head_url: config.snake.head_url
  };

  return res.json(data);
});

// Handle POST request to '/move'
router.post(config.routes.move, function (req, res) {
  // Do something here to generate your move

  // Response data
  var data = {
    move: getMove(req.body), // one of: ["north", "east", "south", "west"]
    taunt: config.snake.taunt.move
  };

  return res.json(data);
});

// Handle POST request to '/end'
router.post(config.routes.end, function (req, res) {
  // Do something here to end your snake's session

  // We don't need a response so just send back a 200
  res.status(200);
  res.end();
  return;
});


module.exports = router;
