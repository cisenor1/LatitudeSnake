import { MoveContent, Point, BoardCell, Directions, BoardCellContent } from "../utilities/utilities";

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

    head: Point;
    height: number;
    width: number;
    currentBoard: BoardCell[][];
    food: Point[];
    constructor(height: number, width: number) { 
        this.height = height;
        this.width = width;
        this.initBoard();
    }

    private initBoard() {
        this.currentBoard = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y == 0) {
                    this.currentBoard[x] = [];
                }
                this.currentBoard[x][y] = {
                    state: BoardCellContent.EMPTY
                }
            }
        }
    }

    private clearBoard() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.currentBoard[x][y] = {
                    state: BoardCellContent.EMPTY
                }
            }
        }
    }

    private setBoardCell(point: Point, state: string, snake?: string): void {
        if (point[0] > this.width || point[0] < 0 || point[1] > this.height || point[1] < 0) {
            throw new Error("Invalid grid space.");
        }
        this.currentBoard[point[0]][point[1]].state = state;
        this.currentBoard[point[0]][point[1]].snake = snake;
    }

    addSnakesToBoard(snakes: Snake[]): void {
        snakes.forEach((snake) => {
            snake.coords.forEach((pt, i) => {
                if (i == 0) {
                    this.setBoardCell(pt, BoardCellContent.HEAD, snake.id);
                    return;
                }
                this.setBoardCell(pt, BoardCellContent.BODY, snake.id);
            });

        });
    }

    addFoodToBoard(food: Point[]) {
        this.food = food;
        food.forEach((f) => {
            this.setBoardCell(f, BoardCellContent.FOOD);
        })
    }

    drawBoard() { 
        let out = "";
        for (var x = 0; x < this.height; x++) {
            for (var y = 0; y < this.height; y++) {
                let state = this.currentBoard[y][x].state;
                if (state == BoardCellContent.EMPTY) {
                    state = " ";
                }
                out += state.charAt(0);
            }
            out += "\n";
        }
        console.log(out);
    }

    setContentBody(body: MoveContent) {
        this.clearBoard();
        let snakes = body.snakes;
        this.addSnakesToBoard(snakes);
        this.addFoodToBoard(body.food);
        // this.drawBoard();
        this.id = body.you;
        let thisSnakes = body.snakes.filter((s) => { return s.id == this.id; });
        if (!thisSnakes.length) {
            throw new Error("NoSnake");
        }
        let thisSnake = thisSnakes[0];
        this.head = thisSnake.coords[0];
        // console.log("Finished Body",thisSnake);
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
    }

    private isItOnTheBoard(x: number, y: number) {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    }

    getUp(): BoardCell {
        let x = this.head[0];
        let y = this.head[1] - 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    }
    getDown(): BoardCell {
        let x = this.head[0];
        let y = this.head[1] + 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    }
    getLeft(): BoardCell {
        let x = this.head[0] - 1;
        let y = this.head[1];
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    }
    getRight(): BoardCell {
        let x = this.head[0] + 1;
        let y = this.head[1];
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL };
        }
        return this.currentBoard[x][y];
    }


    getNeighbors(): OneSpaceNeighbors {
        return {
            up: this.getUp(),
            down: this.getDown(),
            left: this.getLeft(),
            right: this.getRight()
        }
    }

    neighboringFood(): string {
        let n = this.getNeighbors();
        let out = null;
        for (let p in n) {
            if (n[p].state == BoardCellContent.FOOD) {
                out = p;
            }
        }
        return out;
    }

    moveTowardsFood(dodge = false) {
        let food = this.food[0];
        if (!food) {
            return Directions.random();
        }
        let hor = food[0] - this.head[0];
        let vert = food[1] - this.head[1]; 
            if (hor > 0) {
                return Directions.RIGHT;
            }
            if (hor < 0) {
                return Directions.LEFT;
            }
            if (vert < 0) {
                return Directions.UP;
            }
            if (vert > 0) {
                return Directions.DOWN;
            } 
    }

    findClearNeighbor():string{
        let n = this.getNeighbors(); 
        let validOptions = [];
        for (var p in Directions){
            let dir = n[p.toLocaleLowerCase()]; 
            if (!dir){
                continue;
            }
            if (dir.state != BoardCellContent.EMPTY && dir.state != BoardCellContent.FOOD){
                continue;
            }
            validOptions.push(p.toLocaleLowerCase());
        }
        if (!validOptions.length){
            console.log("Found Nothing! ");
            return "down";
        }
        if (validOptions.length == 1){
            let opt = validOptions[0];
            console.log("No choice, going ", opt);
            return opt;
        }
        console.log(validOptions);
        let opt = validOptions[Math.floor(Math.random() *  validOptions.length)];
        console.log("Picked ", opt, " at random");
        return opt;
}

    getNextMove(): string {
        if (this.neighboringFood()) {
            return this.neighboringFood();
        }

        let move = this.moveTowardsFood();
        let target = this.getNeighbors()[move];
        if (target.state != BoardCellContent.EMPTY && target.state != BoardCellContent.FOOD) {
            return this.findClearNeighbor();
        }
        return move;
    }

}
export interface OneSpaceNeighbors {
    up: BoardCell;
    down: BoardCell;
    left: BoardCell;
    right: BoardCell;
}