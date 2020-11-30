const Cell = require("./cell");

function Map(len) {
  this.len = len;
  this.cells = Array.from(Array(len), () => new Array(len));
}

/* get cell */
Map.prototype.getCell = function(x, y) {
  return this.cells[x][y];
};

/* set cell */
Map.prototype.setCell = function(x, y, cell) {
  this.cells[x][y] = cell;
};

/* inicialize Cells, set coordenates and init states in false */
Map.prototype.initWorld = function() {
  for (let i = 0; i < this.len; i++) {
    for (let j = 0; j < this.len; j++) {
      this.cells[i][j] = new Cell(i, j);
    }
  }
};

/* set the state for every cell */
Map.prototype.setThreats = function() {
  this.setNeighbors();
  for (let i = 0; i < this.len; i++) {
    for (let j = 0; j < this.len; j++) {
      if (i !== 0 || j !== 0) {
        if (this.setPit()) {
          let cell = this.cells[i][j];
          cell.value = "P";
          cell.state.pit = true;
          cell.setBreeze();
        }
      }
    }
  }

  this.setWumpus();
  this.setGold();
};

Map.prototype.initState = function() {
  this.setNeighbors();
  for (let i = 0; i < this.len; i++) {
    for (let j = 0; j < this.len; j++) {
      this.cells[i][j].state = {
        pit: null,
        wumpus: null,
        gold: null,
        stench: null,
        breeze: null
      };
    }
  }
};

/* determine if set pit on a cell or not */
Map.prototype.setPit = function() {
  if (Math.random() < 0.2) return true;

  return false;
};

/* set the wumpus in the map */
Map.prototype.setWumpus = function() {
  let x = Math.floor(Math.random() * Math.floor(this.len - 1));
  let y = Math.floor(Math.random() * Math.floor(this.len - 1));
  let cell = this.cells[x][y];

  if (cell.state.pit || (x === 0 && y === 0)) {
    this.setWumpus();
  } else {
    cell.value = "W";
    cell.state.wumpus = true;
    cell.setStench();
  }
};

/* set the gold in the map */
Map.prototype.setGold = function() {
  let x = Math.floor(Math.random() * Math.floor(this.len - 1));
  let y = Math.floor(Math.random() * Math.floor(this.len - 1));
  let cell = this.cells[x][y];

  if (cell.state.pit || (x === 0 && y === 0)) {
    this.setGold();
  } else {
    if (cell.value === "W") {
      cell.value = "*";
    } else {
      cell.value = "G";
    }

    cell.state.gold = true;
  }
};

/* set neighbors of every cell */
Map.prototype.setNeighbors = function() {
  for (let i = 0; i < this.len; i++) {
    for (let j = 0; j < this.len; j++) {
      if (j + 1 < this.len) {
        this.cells[i][j].neighbors.push(this.cells[i][j + 1]);
      }
      if (j - 1 >= 0) {
        this.cells[i][j].neighbors.push(this.cells[i][j - 1]);
      }
      if (i + 1 < this.len) {
        this.cells[i][j].neighbors.push(this.cells[i + 1][j]);
      }
      if (i - 1 >= 0) {
        this.cells[i][j].neighbors.push(this.cells[i - 1][j]);
      }
    }
  }
};

/* basic print of map */
Map.prototype.showMap = function() {
  for (let i = 0; i < this.len; i++) {
    for (let j = 0; j < this.len; j++) {
      console.log(this.cells[i][j].value);
    }
    console.log("");
  }
};

module.exports = Map;
