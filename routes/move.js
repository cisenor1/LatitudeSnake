"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getMove(board, body) {
    board.setContentBody(body);
    return board.getNextMove();
}
exports.getMove = getMove;
