'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

   app.route("/api/check").post((req, res) => {
  const { puzzle, coordinate, value } = req.body;

  // Validate required fields
  if (!puzzle || !coordinate || !value) {
    return res.json({ error: "Required field(s) missing" });
  }

  // Validate value is a number between 1 and 9
  if (!/^[1-9]$/.test(value)) {
    return res.json({ error: "Invalid value" });
  }

  // Validate coordinate format
  const [row, column] = coordinate.split("");
  if (coordinate.length !== 2 || !/[a-i]/i.test(row) || !/[1-9]/.test(column)) {
    return res.json({ error: "Invalid coordinate" });
  }

  // Validate puzzle length and characters
  if (puzzle.length !== 81) {
    return res.json({ error: "Expected puzzle to be 81 characters long" });
  }
  if (/[^0-9.]/.test(puzzle)) {
    return res.json({ error: "Invalid characters in puzzle" });
  }

  // Convert row to index (since row is represented as letters)
  const rowIndex = row.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0); // 'a' becomes 0, 'b' becomes 1, etc.
  const colIndex = parseInt(column) - 1; // Columns 1-9 correspond to 0-8

  // Get the value already in the puzzle at the provided coordinate
  const index = rowIndex * 9 + colIndex; // Get the 1D array index
  const currentValue = puzzle[index];

  // Check if the value is already placed at the coordinate
  if (currentValue === value) {
    return res.json({ valid: true });
  }

  // Check puzzle placements (row, column, and region)
  const validRow = solver.checkRowPlacement(puzzle, row, column, value);
  const validCol = solver.checkColPlacement(puzzle, row, column, value);
  const validReg = solver.checkRegionPlacement(puzzle, row, column, value);

  // If all checks pass, return valid: true, otherwise specify conflicts
  if (validRow && validCol && validReg) {
    return res.json({ valid: true });
  } else {
    const conflicts = [];
    if (!validRow) conflicts.push("row");
    if (!validCol) conflicts.push("column");
    if (!validReg) conflicts.push("region");

    return res.json({ valid: false, conflict: conflicts });
  }
});


    
 
  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;
    if (!puzzle) {
     return res.json({ error: "Required field missing" });
    }
    if (puzzle.length != 81) {
      res.json({ error: "Expected puzzle to be 81 characters long" });
      return;
    }
    if (/[^0-9.]/g.test(puzzle)) {  
      return res.json({ error: "Invalid characters in puzzle" });
      
    }
    let solvedString = solver.solve(puzzle);
    if (!solvedString) {
      return res.json({ error: "Puzzle cannot be solved" });
    } else {
      return res.json({ solution: solvedString });
    }
  });
};
