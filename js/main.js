/*----- constants -----*/
const COLORS = {
  '0': 'white',
  '1': 'purple',
  '-1': 'lime'
};

/*----- app's state (variables) -----*/ 
let board, turn, winner;

/*----- cached element references -----*/


/*----- event listeners -----*/ 


/*----- functions -----*/

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
}