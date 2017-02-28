import { MoveContent, BoardCell, Directions, BoardCellContent } from "../utilities/utilities";
import { astar, Graph } from "javascript-astar-master";
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
    turn = 0;

    LOOPING_LENGTH = 1;
    head: number[];
    height: number;
    width: number;
    currentBoard: BoardCell[][];
    foodList: number[][];
    otherSnake;
    avoidFood: boolean = false;
    private astarBoard: Graph;
    private UP = [0, -1];
    private DOWN = [0, 1];
    private LEFT = [-1, 0];
    private RIGHT = [1, 0];

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

    private updateAStarBoard(avoidFood: boolean = false) {
        let weightedBoard = [];
        this.turn++;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y == 0) {
                    weightedBoard[x] = [];
                }
                let cell = this.currentBoard[x][y];
                let weightedCell;
                if (cell.state == BoardCellContent.WALL || cell.snake || (avoidFood && cell.state == BoardCellContent.FOOD)) {
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
        let allSnakes = body.snakes.filter((s) => { return s.id == this.id; });
        let thisSnake = allSnakes[0];
        this.head = thisSnake.coords[0];
        this.coords = thisSnake.coords;
        this.health_points = thisSnake.health_points;
        this.otherSnake = body.snakes.filter((s) => { return s.id != this.id; })[0];
        this.otherSnake.head = this.otherSnake.coords[0];
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
        let ourDirections = null;
        for (let p in n) {
            if (n[p].state == BoardCellContent.FOOD) {
                ourDirections = p;
            }
        }
        return ourDirections;
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
        let opt;
        //console.log("Valid Options:", validOptions);
        if (!validOptions.length) {
            opt = Directions.DOWN;
        } else {
            opt = validOptions[Math.floor(Math.random() * validOptions.length)];
        }
        return opt;

    }

    private getNode(dir: string) {
        let headX = this.head[0];
        let headY = this.head[1];

        switch (dir) {
            case Directions.UP:
                return [
                    headX + this.UP[0],
                    headY + this.UP[1]
                ]
            case Directions.DOWN:
                return [
                    headX + this.DOWN[0],
                    headY + this.DOWN[1]
                ]
            case Directions.LEFT:
                return [
                    headX + this.LEFT[0],
                    headY + this.LEFT[1]
                ]
            case Directions.RIGHT:
                return [
                    headX + this.RIGHT[0],
                    headY + this.RIGHT[1]
                ]
        }
    }

    weGotLastFood(): boolean {
        return
    }

    /*
        get their head.
        who gets the next food.
        if us, determine if we should loop, or eat
            if we got the last food: yes // our health > their health
            if (canCircle)    // not on edge, this.len  > loopleng
                loop
        if Looping, 
            how for to do loop:
                get food location, 
                build a grid around it,
                if our leng < 9, hug 1 square radius


    */

    getNextMove(): string {
        let food = this.getFoodNode();
        let head = this.getHeadNode();
        let enemy = this.getEnemyHead();
        let ourDirections = astar.search(this.astarBoard, head, food);
        let theirDirections = astar.search(this.astarBoard, enemy, food);
        if (this.areWeCloser(ourDirections, theirDirections)) {
            let newPath = this.shouldWeLoop(ourDirections, theirDirections);
            if (newPath) {
                console.log("Planning on looping: " + newPath.length.toString());
                if (newPath.length == 0){
                    console.log("MOM! WERE LOOPING!");
                } 
                this.getOldMove(newPath);
            }
            return this.getOldMove(ourDirections)
        } else {
            //console.log("ShouldNotFood");
            return this.getOldMove(ourDirections);
        }
    }

    private isOnBorder(inCoords) {
        let x = inCoords[0];
        let y = inCoords[1];
        if (x == this.width - 1 || x == 0) {
            return true;
        }
        if (y == this.height - 1 || y == 0) {
            return true;
        }
        return false;
    }

    shouldWeLoop(ourDirections, theirDirections) {
        if (this.coords.length < this.LOOPING_LENGTH) {
            return false;
        }
        let food = this.foodList[0];
        if (this.health_points < this.otherSnake.health_points){
            return false;
        }

        if (this.isOnBorder(food)) {
            return false;
        }
        let theirShortPath = this.getGridEntryPoint(theirDirections);
        this.updateAStarBoard(true);
        //this.astarBoard.grid[food[0]][food[1]].weight = 0;
        //console.log(theirShortPath);
        //console.log(theirShortPath[theirShortPath.length - 1]);
        let newPath = astar.search(this.astarBoard, this.getHeadNode(), theirShortPath[theirShortPath.length - 1]);
        let wereCloser = this.areWeCloser(newPath, theirShortPath);
        if (!wereCloser) {
            return false;
        }
        return newPath;
    }

    getGridEntryPoint(theirAStarPath) {
        let food = this.foodList[0];
        //console.log(theirAStarPath.grid);
        let lastItem = theirAStarPath.length - 2; // because we don't care about food.
        while (this.isInGrid(theirAStarPath[lastItem]) && lastItem >= 0) {
            lastItem--;
        }
        return theirAStarPath.slice(0, lastItem + 2); // theirAStarPath[lastItem + 1];
    }

    isInGrid(target): boolean {
        let food = this.foodList[0];
        return Math.abs(food[0] - target.x) <= 1 && Math.abs(food[1] - target.y) <= 1;
    }

    private areWeCloser(us, them) {
        if (!them.length) {
            return true;
        }
        return us.length < them.length;
    }


    private getOldMove(ourDirections) {
        let nextSpot = ourDirections[0];
        if (!nextSpot) {
            // Stall method extremely unlikely.
            //console.log("Found no valid path. Searching for open neighbor.");
            let secondTryDir = this.findClearNeighbor();
            if (!secondTryDir) {
                //console.log("Still Nothing");
                return Directions.DOWN;
            }
            return secondTryDir;
        }
        let move = this.getDirectionFromGridElement(nextSpot.x, nextSpot.y);
        return move;
    }

    private getEnemyHead() {
        if (!this.otherSnake) {
            return null;
        }
        let headX = this.otherSnake.head[0];
        let headY = this.otherSnake.head[1];
        return this.astarBoard.grid[headX][headY];
    }

    private getFoodNode() {
        let foodX = this.foodList[0][0];
        let foodY = this.foodList[0][1];
        return this.astarBoard.grid[foodX][foodY];
    }

    private getHeadNode() {
        let headX = this.head[0];
        let headY = this.head[1];
        return this.astarBoard.grid[headX][headY];
    }


    private getDirectionFromGridElement(x: number, y: number): string {
        let headx = this.head[0];
        let heady = this.head[1];
        let xdif = x - headx;
        let ydif = y - heady;
        let absX = Math.abs(xdif);
        let absY = Math.abs(ydif);
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