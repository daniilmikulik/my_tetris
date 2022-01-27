class Canvas {
    constructor(canvasId){
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.heightCoeff = 6;
        this.widthCoeff = 6;
    }

    setCoefficients(heightCoeff, widthCoeff){
        this.heightCoeff = heightCoeff;
        this.widthCoeff = widthCoeff;
    }

    drawFigure(figure, offset=0){
        this.drawMatrix(figure.shape, offset);
    }

    drawMatrix(matrix, offset=0){
        for (let y = 0; y < matrix.length; y++){
            for (let x = 0; x < matrix[y].length; x++){
                if (matrix[y][x]){
                    this.setColor(colors[matrix[y][x] - 1]);
                    this.drawBlock(x, y, offset);
                }
            }
        }
    }

    setContextStyle(color){
        this.setColor(color);
        this.context.clearRect(0, 0, this.width, this.height);
    }

    setColor(color){
        this.context.fillStyle = color;
        this.context.strokeStyle = color;
    }

    drawBlock(x, y, offset=0){
        let cellHeight = this.height / this.heightCoeff;
        let cellWidth = this.width / this.widthCoeff;

        this.context.fillRect(cellWidth * x + offset, cellHeight * y + offset, cellWidth - 1, cellHeight - 1);
        this.context.strokeRect(cellWidth * x + offset , cellHeight * y + offset, cellWidth - 1, cellHeight - 1);
    }

    clearBlock(x, y){
        let cellHeight = this.height / this.heightCoeff;
        let cellWidth = this.width / this.widthCoeff;
        this.context.clearRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
    }
}

class Figure{
    constructor(shape){
        this.shape = shape;
        this.color = null;
        this.x = 0;
        this.y = 0;
        this.width = shape[0].length;
        this.height = shape.length;
    }

    setColor(color){
        this.color = color;

        for(let y = 0; y < this.shape.length; y++){
            for(let x = 0; x < this.shape[y].length; x++){
                if (this.shape[y][x]){
                    this.shape[y][x] = colors.indexOf(this.color) + 1;
                }
            }
        }
    }

    moveRight(){
        this.x += 1;
    }

    moveLeft(){
        this.x -= 1;
    }

    moveDown(){
        this.y += 1;
    }

    rotateClockwise() {
        const n = this.shape.length;
        const m = this.shape[0].length;

        let copy = []
        for(let i = 0; i < m; i++){
            copy[i] = [];
            for(let j = 0; j < n; j++){
                copy[i][j] = this.shape[n - j - 1][i];
            }
        }

        this.shape = copy;
        this.height = this.shape.length;
        this.width = this.shape[0].length;
    }
}

class Game{
    constructor(figures){
        this.showCanvas = new Canvas("figure_show");
        this.fieldCanvas = new Canvas("field");
        this.figures = null;
        this.field = null;
        this.fieldHeight = 0;
        this.fieldWidth = 0;
        this.currentFigure = null;
        this.points = 0;
        this.level = 1;
        this.gameSpeed = 500;

        this.setFigures(figures);
        this.createField();
    }

    createField(height = 20, width = 10){
        this.field = []
        this.fieldHeight = height;
        this.fieldWidth = width;

        for (let y = 0; y < height; y++){
            this.field[y] = [];
            for (let x = 0; x < width; x++){
                this.field[y][x] = 0;
            }
        }
    }

    setFigures(figures){
        this.figures = figures;
    }

    generateFigure(){
        const numFigures = this.figures.length;
        const numColors = colors.length;
        let figure = new Figure(this.figures[Math.floor(Math.random() * numFigures)])
        figure.setColor(colors[Math.floor(Math.random() * numColors)]);
        this.currentFigure = figure;
    }

    drawFigure(offset=0){
        this.showCanvas.setContextStyle(this.currentFigure.color);
        this.showCanvas.drawFigure(this.currentFigure, offset);
    }

    drawField(){
        this.fieldCanvas.setContextStyle();
        this.fieldCanvas.setCoefficients(this.fieldHeight, this.fieldWidth);
        this.fieldCanvas.drawMatrix(this.field);
    }

    generateStartX(){
        return Math.floor(Math.random() * (this.fieldWidth - MAX_FIGURE_WIDTH - 1));
    }

    addFigureToField(){
        for (let y = 0; y < this.currentFigure.shape.length; y++){
            for (let x = 0; x < this.currentFigure.shape[y].length; x++){
                if (this.currentFigure.shape[y][x]){
                    this.field[y + this.currentFigure.y][x + this.currentFigure.x] = colors.indexOf(this.currentFigure.color) + 1;
                }
            }
        }
    }

    isPositionPossible(){
        for (let y = 0; y < this.currentFigure.height; y++){
            for(let x = 0; x < this.currentFigure.width; x++){
                if (this.currentFigure.shape[y][x] && this.field[y + this.currentFigure.y][x + this.currentFigure.x]){
                    return false;
                }

            }
        }
        return true;
    }

    setStartPos(){
        this.currentFigure.x = this.generateStartX();
        this.currentFigure.y = 0;
    }

    rotateFigure(){
        this.removeFigureFromField(this.currentFigure);
        if (!this.isRotationValid(this.currentFigure)){
            this.currentFigure.rotateClockwise();
            this.currentFigure.rotateClockwise();
            this.currentFigure.rotateClockwise();
        }
        this.addFigureToField(this.currentFigure);
    }

    moveDownFigure(){
        if (this.isMoveDownValid(this.currentFigure))
            this.moveDown(this.currentFigure);
    }

    moveRightFigure(){
        if (this.isMoveRightValid(this.currentFigure))
            this.moveRight(this.currentFigure);
    }

    moveLeftFigure(){
        if (this.isMoveLeftValid(this.currentFigure))
            this.moveLeft(this.currentFigure);
    }

    isMoveDownValid(){
        if ((this.currentFigure.y + this.currentFigure.height) >= this.fieldHeight) {
            return false;
        }


        for (let x = 0; x < this.currentFigure.width; x++){
            if(this.currentFigure.shape[this.currentFigure.height - 1][x] && this.field[this.currentFigure.height + this.currentFigure.y][x + this.currentFigure.x]){
                return false;
            } else if (this.currentFigure.shape[this.currentFigure.height - 1][x] === 0 && this.field[this.currentFigure.height - 1 + this.currentFigure.y][x + this.currentFigure.x]){
                if (this.currentFigure.height > 1 && this.currentFigure.shape[this.currentFigure.height - 2][x] !== 0)
                    return false;
            }
        }

        return true;
    }

    isMoveRightValid(){
        if ((this.currentFigure.x + this.currentFigure.width) === this.fieldWidth){
            return false;
        }

        for (let y = 0; y < this.currentFigure.height; y++){
            if (this.currentFigure.shape[y][this.currentFigure.width - 1] && this.field[y + this.currentFigure.y][this.currentFigure.x + this.currentFigure.width]){
                return false;
            } else if (this.currentFigure.shape[y][this.currentFigure.width - 1] === 0 && this.field[y + this.currentFigure.y][this.currentFigure.x + this.currentFigure.width - 1]){
                return false;
            }
        }

        return true;
    }

    isMoveLeftValid(){
        if (this.currentFigure.x === 0){
            return false;
        }

        for(let y = 0; y < this.currentFigure.height; y++){
            if (this.currentFigure.shape[y][0] && this.field[y + this.currentFigure.y][this.currentFigure.x - 1]){
                return false;
            } else if (this.currentFigure.shape[y][0] === 0 && this.field[y + this.currentFigure.y][this.currentFigure.x]){
                return false;
            }
        }

        return true;
    }

    isRotationValid(){
        this.currentFigure.rotateClockwise();
        return this.isPositionPossible(this.currentFigure);
    }

    moveDown(){
        this.removeFigureFromField(this.currentFigure);
        this.currentFigure.moveDown();
        this.addFigureToField(this.currentFigure);
    }

    moveRight(){
        this.removeFigureFromField(this.currentFigure);
        this.currentFigure.moveRight();
        this.addFigureToField(this.currentFigure);
    }

    moveLeft(){
        this.removeFigureFromField(this.currentFigure);
        this.currentFigure.moveLeft();
        this.addFigureToField(this.currentFigure);
    }

    removeFigureFromField(){
        for (let y = 0; y < this.currentFigure.shape.length; y++){
            for (let x = 0; x < this.currentFigure.shape[y].length; x++){
                if (this.currentFigure.shape[y][x]){
                    this.field[y + this.currentFigure.y][x + this.currentFigure.x] = 0;
                    this.fieldCanvas.clearBlock(x + this.currentFigure.x, y + this.currentFigure.y);
                }
            }
        }
    }

    isGameOver(){
        return (this.isPositionPossible(this.currentFigure) === false) || (this.isMoveDownValid(this.currentFigure) === false);
    }

    clear(){
        for(let y = 0; y < this.fieldHeight; y++){
            for(let x = 0; x < this.fieldWidth; x++){
                //if(this.field[y][x]){
                this.fieldCanvas.clearBlock(x, y);
                this.field[y][x] = 0;
                //}
            }
        }
    }

    checkRowsForDeletion(){
        let emptyRow = [];
        for (let i = 0; i < this.fieldWidth; i++){
            emptyRow.push(0);
        }

        for(let y = 0; y < this.fieldHeight; y++){
            if (this.field[y].every(item => item !== 0)){
                this.field.splice(y, 1);
                this.field.unshift(emptyRow);
                this.incrementLevel();
            }
        }

    }

    incrementLevel(){
        this.points += 10 * this.level;
        this.level++;
        this.gameSpeed -= this.gameSpeed > 200 ? (100 / this.level) : 0;
        document.getElementById("currentLevel").innerHTML = "Текущий уровень: " + this.level;
        document.getElementById("points").innerHTML = "Всего очков: " + this.points;
    }

    updateRecords(){
        let records;
        let name = localStorage.getItem("playerName");

        if (!localStorage.hasOwnProperty("records")){
            records = [];
            records.push({"name": name, "points" : this.points});
            localStorage.setItem("records", JSON.stringify(records));
        } else {
            records = JSON.parse(localStorage.getItem("records"));
            records.push({"name": name, "points" : this.points});
            records.sort((a, b) => b.points - a.points);
            localStorage.setItem("records", JSON.stringify(records.slice(0, records.length > 5 ? 5 : records.length)));
        }
        this.generateTableRecords(records);
    }

    generateTableRecords(records){
        let table = "<table>";
        table += "<h2>Таблица рекордов:</h2>";
        table += "<tr>" +
            "    <th> Ранг </th>" +
            "    <th> Имя игрока </th>" +
            "    <th> Очки </th>" +
            "  </tr>";
        for (let i = 0; i < records.length; i++){
            table += "<tr>";
            table += "<td>" + (i + 1) + "</td>";
            table += "<td>" + records[i].name + "</td>";
            table += "<td>" + records[i].points + "</td>";
            table += "</tr>";
        }
        table += "</table>";
        document.getElementById("tableRecords").innerHTML = table;
    }
}

const MAX_FIGURE_WIDTH = 4;

const figures = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[ 0, 1, 0], [1, 1, 1], [0, 1, 0]]
]

const colors = [
    'black',
    'green',
    'red',
    'blue',
    'yellow',
    'orange',
    'purple'
]

function mainGame(){
    let main = new Game(figures);

    if (localStorage.hasOwnProperty("records")){
        main.generateTableRecords(JSON.parse(localStorage.getItem("records")));
    }

    document.addEventListener('keydown', function(event) {
        switch (event.which){
            case 37:
                main.moveLeftFigure();
                main.drawField();
                break;
            case 38:
                main.rotateFigure();
                main.drawField();
                break;
            case 39:
                main.moveRightFigure();
                main.drawField();
                break;
            case 40:
                while(main.isMoveDownValid()){
                    main.moveDownFigure();
                }
                main.drawField();
                break;
        }
    });

    main.generateFigure();
    main.drawFigure(50);
    main.setStartPos();
    main.addFigureToField();
    main.drawField();

    setInterval(() => {
        loop(main);
    }, main.gameSpeed);
}

function loop(main){
    if (main.isMoveDownValid(main.currentFigure) === true) {
        main.moveDownFigure(main.currentFigure);
        main.drawField();
    } else {
        main.checkRowsForDeletion();
        main.generateFigure();
        main.setStartPos();

        if (main.isGameOver()){
            alert("Game Over!");
            main.clear();
            main.updateRecords();
            window.location.href = ("../html/start.html");
            return false;
        }

        main.drawFigure(50);
        main.addFigureToField();
        main.drawField();
    }
}

let name = localStorage.getItem("playerName");
document.getElementById("playerName").innerHTML = "Текущий игрок: " + name;
mainGame();


