const lodash = require("lodash");
const Map = require("./map");

function Agent(world, size) {
  this.size = size;
  this.world = world;
  this.currentCell = lodash.clone(world.cells[0][0]);
  this.knowledgeBase = new Map(size);
  this.knowledgeBase.initWorld();
  this.knowledgeBase.initState();
  this.map = this.knowledgeBase.cells;
  this.visited = [];
  this.hasArrow = true;
  this.hasGold = false;
  this.isWumpusAlive = true;
  this.score = 0;
}

Agent.prototype.getCurrentCell = function() {
  return this.map[this.currentCell.x][this.currentCell.y];
};

Agent.prototype.getWorldCell = function(cell) {
  return this.world.cells[cell.x][cell.y];
};

Agent.prototype.calculateScore = function(cell, origin) {
  while (cell !== origin) {
    this.score -= 1;
    cell = cell.previous;
  }
};

Agent.prototype.dfs = function(origin, destination) {
  let cellVisited = [];
  let stack = [];
  stack.push(origin);

  while (stack.length > 0) {
    let cell = stack.pop();

    if (cellVisited.includes(cell)) {
      continue;
    } else {
      cellVisited.push(cell);
    }

    if (cell === destination) {
      this.calculateScore(cell, origin);
      return this.getWorldCell(cell);
    }

    cell.neighbors.forEach(neighbor => {
      if (!cellVisited.includes(neighbor) && neighbor.value === "S") {
        neighbor.previous = cell;
        stack.push(neighbor);
      }
    });
  }

  return false;
};

Agent.prototype.update = function(addMap) {
  let cell = this.getCurrentCell();
  this.updateCell(cell);
  this.updateKnowledgeBase();
  cell.value = "X";
  addMap(lodash.cloneDeep(this.knowledgeBase));
  cell.value = "S";
};

Agent.prototype.gameOver = function(addMap) {
  console.log("now in :", {
    score: this.score,
    x: this.currentCell.x,
    y: this.currentCell.y,
    current: this.currentCell
  });

  let cell = this.getWorldCell(this.currentCell);

  if (cell.state.pit) {
    this.currentCell.state.pit = true;
    this.update(addMap);
    console.log("se cayo a un hoyo :(");
    this.score -= 1000;
    return true;
  } else if (cell.state.wumpus) {
    this.currentCell.state.wumpus = true;
    this.update(addMap);
    console.log("se encontro con el wumpus!");
    this.score -= 1000;
    return true;
  } else if (cell.state.gold) {
    this.currentCell.state.gold = true;
    this.update(addMap);
    console.log("escapo con el oro, felicidades :)");
    this.score += 1000;
    return true;
  }

  return false;
};

Agent.prototype.updateCell = function(cell) {
  const { gold, stench, breeze } = this.getWorldCell(cell).state;
  cell.value = "S";
  this.visited.push(cell);

  if (gold) {
    cell.state.gold = true;
    this.hasGold = true;
  }

  if (breeze) {
    cell.state.breeze = true;
    cell.neighbors.forEach(neighbor => {
      if (
        !this.visited.includes(neighbor) &&
        neighbor.value === "_" &&
        neighbor.state.pit !== false
      ) {
        neighbor.value = "?";
      }
    });
  } else {
    cell.state.breeze = false;
    cell.neighbors.forEach(neighbor => {
      neighbor.state.pit = false;
    });
  }

  if (stench) {
    cell.state.stench = true;
    cell.neighbors.forEach(neighbor => {
      if (
        !this.visited.includes(neighbor) &&
        neighbor.value === "_" &&
        neighbor.state.wumpus !== false
      ) {
        neighbor.value = "?";
      }
    });
  } else {
    cell.state.stench = false;
    cell.neighbors.forEach(neighbor => {
      neighbor.state.wumpus = false;
    });
  }
};

Agent.prototype.updateKnowledgeBase = function() {
  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      const cell = this.map[i][j];
      const { pit, wumpus } = cell.state;

      if (pit === false && wumpus === false) {
        cell.value = "S";
      } else if (cell.value === "?") {
        let wumpusCount = 0;
        cell.neighbors.forEach(neighbor => {
          const { breeze, stench } = neighbor.state;
          if (breeze === false && stench === false) {
            cell.state.pit = false;
            cell.state.wumpus = false;
            cell.value = "S";
          }

          if (stench === true) wumpusCount += 1;
        });

        if (wumpusCount > 2) {
          cell.state.wumpus = true;
          cell.value = "W";
        } else {
          cell.state.wumpus = false;
        }
      }
    }

    for (let j = 0; j < this.size; j++) {
      const cell = this.map[i][j];
      const { breeze, stench } = cell.state;

      if (breeze === true) {
        this.hasPit(cell);
      }
      if (stench === true) {
        this.hasWumpus(cell);
      }
    }
  }
};

Agent.prototype.hasPit = function(cell) {
  let safeCellsCount = 0;
  let possiblePit = null;
  cell.neighbors.forEach(neighbor => {
    if (neighbor.value === "S") {
      safeCellsCount += 1;
    } else if (neighbor.value === "?") {
      possiblePit = neighbor;
    }
  });

  if (safeCellsCount === cell.neighbors.length - 1) {
    if (possiblePit !== null) {
      possiblePit.value = "P";
      possiblePit.state.pit = true;
    }
  }
};

Agent.prototype.hasWumpus = function(cell) {
  let safeCellsCount = 0;
  let possibleWumpus = null;
  cell.neighbors.forEach(neighbor => {
    if (neighbor.value === "S") {
      safeCellsCount += 1;
    } else if (neighbor.value === "?") {
      possibleWumpus = neighbor;
    }
  });

  if (safeCellsCount === cell.neighbors.length - 1) {
    if (possibleWumpus !== null) {
      possibleWumpus.value = "W";
      possibleWumpus.state.wumpus = true;
    }
  }
};

Agent.prototype.noSafeMovements = function() {
  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      let cell = this.map[i][j];
      if (cell.value === "?") {
        return false;
      }
    }
  }

  return true;
};

Agent.prototype.guessMove = function(cell) {
  let randomInt = Math.floor(Math.random() * Math.floor(cell.neighbors.length));

  let guessCell = cell.neighbors[randomInt];

  if (guessCell.value !== "?") {
    guessCell = this.guessMove(cell);
  }

  console.log("*adivinando movimiento*", { x: guessCell.x, y: guessCell.y });
  return guessCell;
};

Agent.prototype.solveMove = function(cell) {
  if (this.map[0][0] === cell && cell.state.stench && this.hasArrow) {
    this.hasArrow = false;
    this.score -= 10;
    console.log("flecha lanzada!");
    if (this.getWorldCell(this.map[0][1]).state.wumpus) {
      let wumpusCell = this.map[0][1];
      this.isWumpusAlive = false;
      wumpusCell.removeStench();

      let wumpusWorldCell = this.getWorldCell(wumpusCell);
      wumpusWorldCell.removeStench();

      console.log("mato al wumpus");
    }

    if (this.isWumpusAlive) {
      let wumpusCell = this.map[1][0];
      wumpusCell.state.wumpus = true;
      wumpusCell.value = "W";

      console.log("no mato al wumpus");
    }
  }

  if (this.hasGold) {
    return this.dfs(cell, this.map[0][0]);
  }

  for (let i = 0; i < cell.neighbors.length; i++) {
    let neighbor = cell.neighbors[i];
    if (!this.visited.includes(neighbor) && neighbor.value === "S") {
      this.score -= 1;
      return this.getWorldCell(neighbor);
    }
  }

  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      let nextCell = this.map[i][j];
      if (!this.visited.includes(nextCell) && nextCell.value === "S") {
        return this.dfs(cell, nextCell);
      }
    }
  }

  if (this.noSafeMovements() && this.hasArrow) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let auxCell = this.map[0][0];

        if (auxCell.value === "W") {
          if (Math.abs(cell.x - auxCell.x) <= Math.abs(cell.y - auxCell.y)) {
            this.map.forEach(wumpusRow => {
              wumpusRow.forEach(inLineCell => {
                if ((inLineCell.value = "S" && inLineCell.x === auxCell.x)) {
                  console.log("intentando matar");
                  this.dfs(cell, inLineCell);
                }
              });
            });
          } else {
            this.map.forEach(wumpusRow => {
              wumpusRow.forEach(inLineCell => {
                if ((inLineCell.value = "S" && inLineCell.y === auxCell.y)) {
                  console.log("intentando matar");
                  this.dfs(cell, inLineCell);
                }
              });
            });
          }

          this.isWumpusAlive = false;
          auxCell.removeStench();
          auxCell.state.wumpus = false;
          this.hasArrow = false;
          this.score -= 10;
          console.log("mato con una flecha al wumpus!");

          let wumpusWorldCell = this.getWorldCell(auxCell);
          wumpusWorldCell.removeStench();
          wumpusWorldCell.state.wumpus = false;

          return this.dfs(cell, auxCell);
        }
      }
    }
  }

  // else
  this.score -= 1;
  return this.guessMove(cell);
};

Agent.prototype.start = function(addMap) {
  this.map[0][0].value = "S";
  this.map[0][0].state = this.currentCell.state;

  while (!this.gameOver(addMap)) {
    this.update(addMap);
    this.currentCell = this.solveMove(this.getCurrentCell());
  }

  console.log("Game over!\nScore: ", this.score);
};

module.exports = Agent;
