/*----- constants -----*/
const COLORS = {
  '0': 'white',
  '1': 'purple',
  '-1': 'lime'
};

/*----- app's state (variables) -----*/ 
let board, turn, winner;

/*----- cached element references -----*/
const msgEl = document.getElementById('msg');

/*----- event listeners -----*/ 
document.querySelector('section.markers')
  .addEventListener('click', handleClick);

/*----- functions -----*/
init();

function init() {
  board = [
    [0, 0, 0, 0, 0, 0],   // column 1 (index 0)
    [0, 0, 0, 0, 0, 0],   // column 2 (index 1)
    [0, 0, 0, 0, 0, 0],   // column 3 (index 2)
    [0, 0, 0, 0, 0, 0],   // column 4 (index 3)
    [0, 0, 0, 0, 0, 0],   // column 5 (index 4)
    [0, 0, 0, 0, 0, 0],   // column 6 (index 5)
    [0, 0, 0, 0, 0, 0],   // column 7 (index 6)
  ];
  turn = 1;
  winner = null;  // 1, -1, null (no winner), 'T' (tie)
  render();
}

function render() {
  // Render the board
  board.forEach(function(colArr, colIdx) {
    // hide/show the column's marker depending if there are 0's or not
    let marker = document.getElementById(`col${colIdx}`);
    // <conditional exp> ? <truthy thing to return> : <falsey thing to return>;
    // This is a ternary expression that replaces the if/else below it.
    marker.style.visibility = colArr.indexOf(0) === -1 ? 'hidden' : 'visible';
    // if (colArr.indexOf(0) === -1) {
    //   marker.style.visibility = 'hidden';
    // } else {
    //   marker.style.visibility = 'visible';
    // }
    colArr.forEach(function(cell, rowIdx) {
      let div = document.getElementById(`c${colIdx}r${rowIdx}`);
      div.style.backgroundColor = COLORS[cell];
    });
  });
  // Render the message
  if (winner) {

  } else {
    msgEl.textContent = `${COLORS[turn].toUpperCase()}'s Turn`;
  }
}

function handleClick(evt) {
  // get index of column's marker clicked
  let idx = parseInt(evt.target.id.replace('col', ''));
  // make sure the MARKER was clicked
  if (isNaN(idx) || winner) return;
  // obtain the actual column array in board array
  let colArr = board[idx];
  // get the index of the first 0 in the col array
  let rowIdx = colArr.indexOf(0);
  // if the col is full, there are no zeroes, therefore
  // indexOf returns -1.
  // Do nothing if no zeroes available (col full)
  if (rowIdx === -1) return;
  // update the col array (within the board) with
  // the player whose turn it is
  colArr[rowIdx] = turn;
  // flip turns from 1 to -1; -1 to 1
  turn *= -1;
  // update the winner
  winner = getWinner();
  render();
}

function getWinner() {
  // return the winner, 'T' or null
}