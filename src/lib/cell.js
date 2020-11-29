function Cell(x, y) {
  this.x = x;
  this.y = y;
  this.value = "_";
  this.neighbors = [];
  this.state = {
    pit: false,
    wumpus: false,
    gold: false,
    stench: false,
    breeze: false
  };
  this.previous = null;
}

Cell.prototype.setStench = function() {
  this.neighbors.forEach(cell => {
    cell.state.stench = true;
  });
};

Cell.prototype.setBreeze = function() {
  this.neighbors.forEach(cell => {
    cell.state.breeze = true;
  });
};

Cell.prototype.removeStench = function() {
  this.neighbors.forEach(cell => {
    cell.state.breeze = false;
  });
};

module.exports = Cell;
