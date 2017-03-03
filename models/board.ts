import { MoveContent, BoardCell, Directions, BoardCellContent } from "../utilities/utilities";
import { astar, Graph } from "javascript-astar-master";
export interface Point {
    x: number;
    y: number;
}
export class Board {
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
    turn = 0;

    LOOPING_LENGTH = 8;
    PLANNING_LENGTH = 1;
    head: Point;
    height: number;
    width: number;
    currentBoard: BoardCell[][];
    foodList: Point[];
    otherSnake;
    avoidFood: boolean = false;
    private astarBoard: AStarBoard;
    private UP = [0, -1];
    private DOWN = [0, 1];
    private LEFT = [-1, 0];
    private RIGHT = [1, 0];
    private UP_LEFT = [-1, -1];
    private UP_RIGHT = [1, -1];
    private DOWN_RIGHT = [1, 1];
    private DOWN_LEFT = [-1, 1];

    constructor(height: number, width: number, loopingLength: number, planningNumber:number) {
        this.height = height;
        this.width = width;
        this.PLANNING_LENGTH = planningNumber;
        this.LOOPING_LENGTH = loopingLength;
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
                    state: BoardCellContent.EMPTY,
                    x: x,
                    y: y
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
                    state: BoardCellContent.EMPTY,
                    x: x,
                    y: y
                }
            }
        }
    }

    private setBoardCell(point: Point, state: string, snake?: string): void {
        if (point.x > this.width || point.x < 0 || point.y > this.height || point.y < 0) {
            throw new Error("Invalid grid space.");
        }
        this.currentBoard[point.x][point.y].state = state;
        this.currentBoard[point.x][point.y].snake = snake;
    }

    addSnakesToBoard(snakes: Board[]): void {
        snakes.forEach((snake) => {
            snake.coords.forEach((pt, i) => {
                let p = { x: pt[0], y: pt[1] };
                if (i == 0) {
                    this.setBoardCell(p, BoardCellContent.HEAD, snake.id);
                    return;
                }
                this.setBoardCell(p, BoardCellContent.BODY, snake.id);
            });

        });
    }

    addFoodToBoard(food: number[][]) {
        this.foodList = food.map((f) => { return { x: f[0], y: f[1] }; });
        this.foodList.forEach((f) => {
            this.setBoardCell(f, BoardCellContent.FOOD);
        })
    }


    setContentBody(body: MoveContent) {
        this.clearBoard();
        this.addSnakesToBoard(body.snakes);
        this.addFoodToBoard(body.food);
        this.id = body.you;
        let allSnakes = body.snakes.filter((s) => { return s.id == this.id; });
        let thisSnake = allSnakes[0];
        this.head = { x: thisSnake.coords[0][0], y: thisSnake.coords[0][1] };
        this.coords = thisSnake.coords.map((c) => { return { x: c[0], y: c[1] } });
        this.health_points = thisSnake.health_points;
        this.otherSnake = body.snakes.filter((s) => { return s.id != this.id; })[0];
        if (this.otherSnake) {
            this.otherSnake.head = { x: this.otherSnake.coords[0][0], y: this.otherSnake.coords[0][1] };
        }
        this.updateAStarBoard();
    }

    private isItOnTheBoard(x: number, y: number) {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    }

    getUp(): BoardCell {
        let x = this.head.x;
        let y = this.head.y - 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    }
    getDown(): BoardCell {
        let x = this.head.x;
        let y = this.head.y + 1;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    }
    getLeft(): BoardCell {
        let x = this.head.x - 1;
        let y = this.head.y;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    }
    getRight(): BoardCell {
        let x = this.head.x + 1;
        let y = this.head.y;
        if (!this.isItOnTheBoard(x, y)) {
            return { state: BoardCellContent.WALL, x: x, y: y };
        }
        return this.currentBoard[x][y];
    }

    cellIsOurTail(cell: BoardCell): boolean {
        let ourTail = this.coords[this.coords.length - 1];
        let itsOurTail = ourTail.x == cell.x && ourTail.y == cell.y; 
        return itsOurTail;
    }



    // getNeighbors(): OneSpaceNeighbors {
    //     return {
    //         up: this.getUp(),
    //         down: this.getDown(),
    //         left: this.getLeft(),
    //         right: this.getRight()
    //     }
    // }

    // neighboringFood(): string {
    //     let n = this.getNeighbors();
    //     let ourDirections = null;
    //     for (let p in n) {
    //         if (n[p].state == BoardCellContent.FOOD) {
    //             ourDirections = p;
    //         }
    //     }
    //     return ourDirections;
    // }

    // moveTowardsFood(dodge = false) {
    //     let food = this.foodList[0];
    //     if (!food) {
    //         return Directions.random();
    //     }
    //     let hor = food[0] - this.head[0];
    //     let vert = food[1] - this.head[1];
    //     if (hor > 0) {
    //         return Directions.RIGHT;
    //     }
    //     if (hor < 0) {
    //         return Directions.LEFT;
    //     }
    //     if (vert < 0) {
    //         return Directions.UP;
    //     }
    //     if (vert > 0) {
    //         return Directions.DOWN;
    //     }
    // }

    // findClearNeighbor(): string {
    //     let n = this.getNeighbors();
    //     let validOptions = [];
    //     for (var p in Directions) {
    //         let dir = n[p.toLocaleLowerCase()];
    //         if (!dir) {
    //             continue;
    //         }
    //         if (dir.state != BoardCellContent.EMPTY && dir.state != BoardCellContent.FOOD) {
    //             continue;
    //         }
    //         validOptions.push(p.toLocaleLowerCase());
    //     }
    //     let opt; 
    //     if (!validOptions.length) {
    //         opt = Directions.DOWN;
    //     } else {
    //         opt = validOptions[Math.floor(Math.random() * validOptions.length)];
    //     }
    //     return opt;

    // }

    private getNode(dir: string) { 
        let headX = this.head.x;
        let headY = this.head.y;
        let mod;
        switch (dir) {
            case Directions.UP:
                mod = this.UP;
            case Directions.DOWN:
                mod = this.DOWN;
            case Directions.LEFT:
                mod = this.LEFT;
            case Directions.RIGHT:
                mod = this.RIGHT;
            case Directions.UP_LEFT:
                mod = this.UP_LEFT;
            case Directions.UP_RIGHT:
                mod = this.UP_RIGHT;
            case Directions.DOWN_LEFT:
                mod = this.DOWN_LEFT;
            case Directions.DOWN_RIGHT:
                mod = this.DOWN_RIGHT;
        } 
        return this.astarBoard.grid[headX + mod[0]][headY + mod[1]];

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

    foodIsNeighbor(): boolean {
        if (this.getUp().state == BoardCellContent.FOOD || this.getDown().state == BoardCellContent.FOOD || this.getLeft().state == BoardCellContent.FOOD || this.getRight().state == BoardCellContent.FOOD) {
            return true;
        }
        if (this.foodIsDiagonal()){
            return true;
        }
        return false;
    }

    private gridNodeHasFood(pt:Point):boolean{   
        if (pt.x < 0 || pt.x >= this.width || pt.y < 0 || pt.y >= this.height){
            return false;
        }
        return this.currentBoard[pt.x][pt.y].state == BoardCellContent.FOOD;

    }
    private foodIsDiagonal():boolean{  
        let ul = this.gridNodeHasFood({x:this.head.x + this.UP_LEFT[0], y:this.head.y + this.UP_LEFT[1]});
        let dl = this.gridNodeHasFood({x:this.head.x + this.DOWN_LEFT[0], y:this.head.y + this.DOWN_LEFT[1]});
        let ur = this.gridNodeHasFood({x:this.head.x + this.UP_RIGHT[0], y:this.head.y + this.UP_RIGHT[1]});
        let dr = this.gridNodeHasFood({x:this.head.x + this.DOWN_RIGHT[0], y:this.head.y + this.DOWN_RIGHT[1]});
 
        return ul||dl||ur||dr;
    }

    private getQuadrant(point:Point){
        let quadrant = 0;        
        if (point.x < this.width/2){
            // left
        }else{
            //right
            quadrant++;
        }

        if (point.y < this.height/2){
            //up
        }else{
            //down
            quadrant += 2
        }
        return quadrant;
    }

    private getQuadrantPoint(quadrant:number){
        switch (quadrant){
            case 0:
                return {x:Math.floor(this.width/4), y:Math.floor(this.height/4)};
            case 1:
                return {x:Math.floor(this.width*3/4), y:Math.floor(this.height/4)};
            case 2:
                return {x:Math.floor(this.width/4), y:Math.floor(this.height*3/4)};
            case 3:
                return {x:Math.floor(this.width*3/4), y:Math.floor(this.height*3/4)};
        }
    }

    private getOtherQuadrant():Point{
        let food = this.foodList[0];
        let foodQuadrant  = this.getQuadrant(food);
        let ourQuadrant = this.getQuadrant(this.head);
        let remainingQuadrants = [0,1,2,3].filter((x)=>{return x != ourQuadrant && x != foodQuadrant;});
        let targetIndex = Math.floor(Math.random() * remainingQuadrants.length);
        let targetQuadrant = remainingQuadrants[targetIndex]; 
        return this.getQuadrantPoint(targetQuadrant);
}


    shouldNotFood(){
        let destination = this.getOtherQuadrant();
        let dNode = this.astarBoard.grid[destination.x][destination.y];
        let notFoodDirections:GridNode[] = astar.search(this.astarBoard, this.getHeadNode(), dNode);
        return this.getOldMove(notFoodDirections);
    }

    getNextMove(): string {
        let food = this.getFoodNode();
        let head = this.getHeadNode();
        let enemy = this.getEnemyHead();
        let ourDirections: GridNode[] = astar.search(this.astarBoard, head, food);
        let theirDirections: GridNode[] = [];
        if (enemy) {
            theirDirections = astar.search(this.astarBoard, enemy, food);
        }
        if (this.areWeCloser(ourDirections, theirDirections)) { 
            let newPath = this.shouldWeLoop(ourDirections, theirDirections);
            if (newPath) { 
                if (this.foodIsNeighbor()) { 
                    return this.doALoopDeLoop();
                }  
                return this.getOldMove(newPath);
            }
            return this.getOldMove(ourDirections)
        } else { 

            return this.shouldNotFood();
        }
    }

    private getEmptyLeftOrRight(): string {
        let cell = this.getLeft()
        if (cell.state == BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
            return Directions.LEFT;
        }
        return Directions.RIGHT;
    }
    private getEmptyUpOrDown(): string {
        let cell = this.getUp()
        if (cell.state == BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
            return Directions.UP;
        }
        return Directions.DOWN;
    }

    private doALoopDeLoop(): string { 
        let foodLocation = this.getFoodNode();
        
        if (foodLocation.x == this.head.x) { 
            return this.getEmptyLeftOrRight()
        } else if (foodLocation.y == this.head.y) { 
            return this.getEmptyUpOrDown();
        } else {
            // it's diagonal 
            if (foodLocation.x > this.head.x) {
                // it's right
                if (foodLocation.y > this.head.y) {
                    let down = this.getDown();
                    let right = this.getRight();
                    // it's down-right
                    if (down.state == BoardCellContent.EMPTY || this.cellIsOurTail(down)) {
                        return Directions.DOWN;
                    } else if (right.state == BoardCellContent.EMPTY || this.cellIsOurTail(right)) {
                        return Directions.RIGHT;
                    }
                } else {
                    let up = this.getUp();
                    let right = this.getRight();
                    // it's up-right
                    if (up.state == BoardCellContent.EMPTY || this.cellIsOurTail(up)) {
                        return Directions.UP;
                    } else if (right.state == BoardCellContent.EMPTY || this.cellIsOurTail(right)) {
                        return Directions.RIGHT;
                    }
                }
            } else {
                // it's left
                if (foodLocation.y > this.head.y) {
                    let cell = this.getDown()
                    // it's down-left 
                    if (cell.state == BoardCellContent.EMPTY || this.cellIsOurTail(cell)) {
                        return Directions.DOWN;
                    } else {
                        return Directions.LEFT;
                    }
                } else {
                    let cell = this.getUp() 
                    // it's up-left
                    if (cell.state == BoardCellContent.EMPTY || this.cellIsOurTail(cell)) { 
                        return Directions.UP;
                    } else { 
                        return Directions.LEFT;
                    }
                }
            }
        }
    }

    private isOnBorder(inCoords: Point): boolean {
        let x = inCoords.x;
        let y = inCoords.y;
        if (x == this.width - 1 || x == 0) {
            return true;
        }
        if (y == this.height - 1 || y == 0) {
            return true;
        }
        return false;
    }

    private shouldWeLoop(ourDirections: GridNode[], theirDirections: GridNode[]) {
        if (this.coords.length < this.LOOPING_LENGTH) { 
            return false;
        }
        if (this.otherSnake && this.health_points < this.otherSnake.health_points) { 
            return false;
        }
        let food = this.foodList[0];
        if (this.isOnBorder(food)) { 
            return false;
        }
        let head = this.getHeadNode();
        if (!theirDirections.length) { 
            return astar.search(this.astarBoard, head, this.getFoodNode());
        }

        let theirShortPath = this.getGridEntryPoint(theirDirections);
        // this.updateAStarBoard(true);
        //this.astarBoard.grid[food.x][food.y].weight = 0; 
        let theirEntryPoint = theirShortPath[theirShortPath.length - 1];
        return astar.search(this.astarBoard, head, theirEntryPoint);

    }

    private getGridEntryPoint(theirAStarPath: GridNode[]): GridNode[] { 
        let lastItem = theirAStarPath.length - 2; // because we don't care about food.
        while (this.isInGrid(theirAStarPath[lastItem]) && lastItem >= 0) {
            lastItem--;
        }
        return theirAStarPath.slice(0, lastItem + 2); // theirAStarPath[lastItem + 1];
    }

    private isInGrid(target: Point): boolean {
        if (!target) {
            return false;
        }
        let food = this.foodList[0];
        return Math.abs(food.x - target.x) <= 1 && Math.abs(food.y - target.y) <= 1;
    }

    private areWeCloser(us: GridNode[], them: GridNode[]): boolean {
        if(this.otherSnake && this.otherSnake.health_points > this.health_points){
            return true;
        }
        if (!them.length) {
            return true;
        }
        return us.length < them.length;
    }


    private getOldMove(ourDirections: GridNode[]): string {
        let nextSpot = ourDirections[0];
        if (!nextSpot) {
            // Stall method extremely unlikely. 
            // let secondTryDir = this.findClearNeighbor();
            // if (!secondTryDir) { 
            //     return Directions.DOWN;
            // }
            // return secondTryDir;
        }
        let move = this.getDirectionFromGridElement(nextSpot);
        return move;
    }

    private getEnemyHead(): GridNode {
        if (!this.otherSnake) {
            return null;
        }
        let headX = this.otherSnake.head.x;
        let headY = this.otherSnake.head.y;
        return this.astarBoard.grid[headX][headY];
    }

    private getFoodNode(): GridNode {
        let foodX = this.foodList[0].x;
        let foodY = this.foodList[0].y;
        return this.astarBoard.grid[foodX][foodY];
    }

    private getOurTail(): GridNode {
        let tailCoords = this.coords[this.coords.length - 1];
        let tx = tailCoords.x;
        let ty = tailCoords.y;
        return this.astarBoard.grid[tx][ty];
    }

    private getHeadNode(): GridNode {
        let headX = this.head.x;
        let headY = this.head.y;
        return this.astarBoard.grid[headX][headY];
    }


    private getDirectionFromGridElement(inPoint: GridNode): string {
        let xdif = inPoint.x - this.head.x;
        let ydif = inPoint.y - this.head.y;
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

export interface GridNode {
    x: number;
    y: number;
    weight: number;
    f: number;
    g: number;
    h: number;
    visited: boolean;
    closed: boolean;
    parent?: GridNode;
}

export interface AStarBoard extends Graph {
    grid: GridNode[][];
}

export interface OneSpaceNeighbors {
    up: BoardCell;
    down: BoardCell;
    left: BoardCell;
    right: BoardCell;
}