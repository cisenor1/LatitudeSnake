import { MoveContent, BoardCell, Directions, BoardCellContent } from "../utilities/utilities";
import { astar, Graph } from "javascript-astar";
export class Board {
    /** Coordinates of this snake. */
    coords: number[][];
    /** Health of this snake. */
    health_points: number;
    /** ID of this snake. */
    id: string;
    /** Name of this snake. */
    name: string;
    /** This snake's current taunt. */
    taunt: string;

    head: number[];
    height: number;
    width: number;
    currentBoard: BoardCell[][];
    foodList: number[][];
    private astarBoard: Graph;

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

    private updateAStarBoard() {
        let weightedBoard = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y == 0) {
                    weightedBoard[x] = [];
                }
                let cell = this.currentBoard[x][y];
                let weightedCell;
                if (cell.state == BoardCellContent.WALL || cell.snake) {
                    weightedCell = 0;
                } else {
                    weightedCell = 1;
                }
                weightedBoard[x][y] = weightedCell;
            }
        }
        this.astarBoard = new Graph(weightedBoard);
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

    private setBoardCell(point: number[], state: string, snake?: string): void {
        if (point[0] > this.width || point[0] < 0 || point[1] > this.height || point[1] < 0) {
            throw new Error("Invalid grid space.");
        }
        this.currentBoard[point[0]][point[1]].state = state;
        this.currentBoard[point[0]][point[1]].snake = snake;
    }

    addSnakesToBoard(snakes: Board[]): void {
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

    addFoodToBoard(food: number[][]) {
        this.foodList = food;
        food.forEach((f) => {
            this.setBoardCell(f, BoardCellContent.FOOD);
        })
    }


    setContentBody(body: MoveContent) {
        this.clearBoard();
        let snakes = body.snakes;
        this.addSnakesToBoard(snakes);
        this.addFoodToBoard(body.food);
        this.id = body.you;
        let thisSnakes = body.snakes.filter((s) => { return s.id == this.id; });
        let thisSnake = thisSnakes[0];
        this.head = thisSnake.coords[0];
        // console.log("Finished Body",thisSnake);
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
        this.updateAStarBoard();
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
        let food = this.foodList[0];
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

    findClearNeighbor(): string {
        let n = this.getNeighbors();
        let validOptions = [];
        for (var p in Directions) {
            let dir = n[p.toLocaleLowerCase()];
            if (!dir) {
                continue;
            }
            if (dir.state != BoardCellContent.EMPTY && dir.state != BoardCellContent.FOOD) {
                continue;
            }
            validOptions.push(p.toLocaleLowerCase());
        }
        if (!validOptions.length) {
            console.log("Found Nothing! ");
            return "down";
        }
        if (validOptions.length == 1) {
            let opt = validOptions[0];
            console.log("No choice, going ", opt);
            return opt;
        }
        console.log(validOptions);
        let opt = validOptions[Math.floor(Math.random() * validOptions.length)];
        console.log("Picked ", opt, " at random");
        return opt;
    }

    getNextMove(): string {
        let food = this.getFoodNode();
        let head = this.getHeadNode();
        let out = astar.search(this.astarBoard, head, food);
        if (!out.length) {
            console.log(out);
            throw new Error("No path");
        }
        let nextSpot = out[0];
        let move = this.getDirectionFromGridElement(nextSpot.x, nextSpot.y);
        return move;
    }

    private getFoodNode() {
        let foodX = this.foodList[0][0];
        let foodY = this.foodList[0][1];
        console.log("Getting Food:",foodX,foodY,this.astarBoard);
        return this.astarBoard.grid[foodX][foodY];
    }

    private getHeadNode(){
        let headX = this.head[0];
        let headY = this.head[1];
        console.log("Getting Head:",headX,headY,this.astarBoard);
        return this.astarBoard.grid[headX][headY];
    }


    private getDirectionFromGridElement(x: number, y: number): string {
        let headx = this.head[0];
        let heady = this.head[1];
        let xdif = x- headx;
        let ydif = y - heady;
        let absX = Math.abs(xdif);
        let absY = Math.abs(ydif);
        console.log(headx,heady,xdif,ydif,absX,absY);
        if (xdif == 0) {
            if (ydif == 0) {
                throw new Error("Food cannot be on your head!");
            }
            if (ydif < 0) {
                return Directions.UP;
            } else if (ydif > 0) {
                return Directions.DOWN;
            }
        } else if (ydif == 0) {
            if (xdif == 0) {
                throw new Error("Food cannot be on your head!");
            }
            if (xdif < 0) {
                return Directions.LEFT;
            } else if (xdif > 0) {
                return Directions.RIGHT;
            }
        } else if (xdif > 0) {
            return Directions.RIGHT;
        } else if (xdif < 0) {
            return Directions.LEFT;
        }
    }

}
export interface OneSpaceNeighbors {
    up: BoardCell;
    down: BoardCell;
    left: BoardCell;
    right: BoardCell;
}