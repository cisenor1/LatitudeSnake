"use strict";
function getMove(board, body) {
    board.setContentBody(body);
    return board.getNextMove();
}
exports.getMove = getMove;
//# sourceMappingURL=move.js.map