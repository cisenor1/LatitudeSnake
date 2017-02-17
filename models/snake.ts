import { MoveContent, Point } from "../utilities/utilities";

export class Snake {
    /** Coordinates of this snake. */
    coords: Point[];
    /** Health of this snake. */
    health_points: number;
    /** ID of this snake. */
    id: string;
    /** Name of this snake. */
    name: string;
    /** This snake's current taunt. */
    taunt: string;

    constructor() {

    }

    setContentBody(body: MoveContent) {
        this.id = body.you;
        let thisSnakes = body.snakes.filter((s) => { return s.id == this.id; });
        if (!thisSnakes.length) {
            throw new Error("NoSnake");
        }
        let thisSnake = thisSnakes[0];
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
    }

}