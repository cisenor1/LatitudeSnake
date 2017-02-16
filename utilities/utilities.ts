export class BetterError extends Error {
    status: number;
}

export class Directions {
    static UP = "up";
    static DOWN = "down";
    static LEFT = "left";
    static RIGHT = "right";
    private static allDirs = [
        Directions.UP,
        Directions.DOWN,
        Directions.LEFT,
        Directions.RIGHT
    ];
    static random(): string {
        let r =(Math.floor(Math.random() * 10) % 4); 
        return this.allDirs[r];
    }
}
/** All possible contents of a Board Cell */
export class BoardCellContent{
    static HEAD = "head";
    static BODY = "body";
    static FOOD = "food";
    static EMPTY = "empty";
}
export interface BoardCell{
    /** The content of the current cell. One of: head, body, food, empty. */
    state: string;
    /** The ID of the snake currently contained in that board cell. */
    snake?: string;
}
/** Any point on the board. */
export interface Point{
    x:number;
    y:number;
}
/** Slithering monster. */
export interface Snake{
    /** Coordinates of this snake. */
    coords: Point[];
    /** Health of this snake. */
    health_points:number;
    /** ID of this snake. */
    id:string;
    /** Name of this snake. */
    name:string;
    /** This snake's current taunt. */
    taunt:string;

}
/** Content passed with a "/move" request. */
export interface MoveContent{
    /** Mapping of the whole board. */
    board: BoardCell[][];
    /** Location of all the food on the board. */
    food: Point[];
    /** Height of the game board. */
    height: number;
    /** ID string of the current game. Guaranteed to be unique. */
    game_id: string;
    /** All snakes on the board. */
    snakes: Snake[];
    /** Turn number. */
    turn: number;
    /** Width of game board. */
    width:number;
    /** GUID for your snake. */
    you: string;

}