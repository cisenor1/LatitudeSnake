import {Directions,MoveContent} from "../utilities/utilities";
import {Board} from "../models/board"; 

export function getMove(board:Board, body:MoveContent):string{ 
    board.setContentBody(body); 
    return board.getNextMove();
}