import {Directions,MoveContent} from "../utilities/utilities";
export function getMove(body:MoveContent):string{
    console.log(body.snakes)
    return Directions.random();
}