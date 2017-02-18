import {Directions,MoveContent} from "../utilities/utilities";
import {Snake} from "../models/snake"; 

export function getMove(board:Snake, body:MoveContent):string{ 
    board.setContentBody(body);

    return board.getNextMove();
}