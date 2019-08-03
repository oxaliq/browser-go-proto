/*----- constants -----*/
// game state object {gameMeta object, playerMeta object, turn, pass, gameRecord, bCaptures, wCaptures}
const STONES_DATA = {
  '-1': 'white',
  '0': 'none',
  '1': 'black',
  'k': 'ko'
}

const DOTS_DATA = {
  '-1': 'white',
  '0': 'none',
  '1': 'black',
  'd': 'dame',
  'l': 'legal',
  's': 'seki'
}

const gameState = {
  winner: null,
  turn: 1, // turn logic depends on handicap stones
  pass: null,
  komi: null, // komi depends on handicap stones
  handicap: null,
  boardSize: 9,
  playerState: {
    bCaptures: null,
    wCaptures: null
  },
  gameMeta: { // declared at game start and not editable after
    date: null // contains metadata 
  },
  playerMeta: { // editable during game
    b: {
      name: null,
      rank: null, 
      rankCertain: false
    },
    w: {
      name: null,
      rank: null,
      rankCertain: false
    },
  },
  groups: {},
  gameRecord : []
}


// deadShapes{}

// index represents handicap placement, eg handiPlace[1] = { (3, 3), (7, 7) }
const handiPlace = [ 0, 
  [ [ 3, 3 ], [ 7, 7 ] ], 
  [ [ 3, 3 ], [ 7, 7 ], [ 3, 7 ] ], 
  [ [ 3, 3 ], [ 7, 7 ], [ 3, 7 ], [ 7, 3 ] ] ];
  
  /*----- app's state (variables) -----*/
  
  // define initial game state
  
class Point {
  constructor(x, y) {
    this.pos = [ x, y ]
    this.stone = 0; // this is where move placement will go 0, 1, -1 'k'
    this.overlay = 0; // this is where 'chk', 'l'
    this.neighbors = {
      top: {},
      btm: {},
      lft: {},
      rgt: {}
    },
    // neighbor exists it's point is stored as { rPos, cPos}
    this.neighbors.top = x > 1 ? [ x - 1, y ] : null;
    this.neighbors.btm = x < gameState.boardSize ? [ x + 1, y ] : null;
    this.neighbors.rgt = y > 1 ? [ x, y - 1 ] : null;
    this.neighbors.lft = y < gameState.boardSize ? [ x, y + 1 ] : null;
    // checkLegal: function() {
    //   this.cellValue = (for neighbor in this.neighbors) {
    //     boardState.find( val => {
    //       if ( val.pos === neighbor.pos && val.stone = 0) { /*cell empty*/ }
    //     });
    //   }
    //   }
    }
  };
    
    // boardState [point objects-contain overlay] lastState (created from boardState)
let boardState = [ new Point(1,1), new Point(1,2), new Point(1,3),
  new Point(2,1), new Point(2,2), new Point(2,3),
  new Point(3,1), new Point(3,2), new Point(3,3),
];

    
    // modeling 1,1 point for 
  // define boardState and overlay as 2d 9x9 arrays
  // boardState accepts values of 0, 1, -1
  // overlay accepts values of 0, 1, -1, 'k', 'd', 'chk', 'hold', 'l', 'x'
  // 'k' represents komi, in-game integers represent move previews, 
  // 'chk', 'hold', 'x' and 'l' represent points checked during checkLegalMove run
  // game-end integer represent points of territory, 'd' represents dame,
  
  
  /*----- cached element references -----*/
  // store #menu for displaying game info
  // store 
  
  
  /*----- event listeners -----*/
  // input listeners for player names, ranks, rank certainty (editable during game)
  //input lister for handicap + komi (only editable pre-game)
  // ::hover-over on board to preview move (with legal move logic)
  document.getElementById('board').addEventListener('mousemove', checkLegal);
  // click on board to play move
  document.getElementById('board').addEventListener('click', placeStone);
  // ::hover-over on either bowl for pass, one-level undo options (CSS implementation)
  // click on menu items 
  // click on kifu to display game menu
  
  /*----- functions -----*/
init();

let findPointFromIdx = (arr) => boardState.find( point => point.pos[0] === arr[0] && point.pos[1] === arr[1] );

function checkLegal(evt) {
  let hover = [ parseInt(evt.target.parentNode.id[0]), parseInt(evt.target.parentNode.id[2]) ];
  let point = findPointFromIdx(hover);
  //first step in logic: is stone occupied
  point.overlay = point.stone !== 0 ? 0 : 'l';
  render(point);
}

function placeStone(evt) {
  console.log('click!');

  let placement = [ parseInt(evt.target.parentNode.id[0]), parseInt(evt.target.parentNode.id[2]) ];
  // checks for placement and pushes to cell
  let point = findPointFromIdx(placement);
  //checks that this placement was marked as legal
  point.stone = point.overlay === 'l' ? gameState.turn : point.stone;
  gameState.turn*= -1;
  render();
}

function init() {
  gameState.winner = null;
  // gameState.turn = ? : ; // get turn from consequences of player input
  gameState.pass = null;
  // gameState.komi = ; // get komi from player input
  // gameState.handicap = ; // get handicap from player input
  gameState.playerState.bCaptures = 0;
  gameState.playerState.wCaptures = 0;
  // gameState.gameMeta.date = // get from browser window
  // get any future meta from player input
  // gameState.playerMeta.b // get from player input
  // gameState.playerMeta.w // get from player input
  gameState.gameRecord = []; // clear game record from previous game
  // gameState.boardState // create board from user input

  //need init player meta

  render();
};
    
function render(hoverPoint) {
  // console.log('render');
  renderBoard();
  renderPreview(hoverPoint);
}

function renderBoard() {
  boardState.forEach(val => {
    let stone = document.getElementById(`${val.pos[0]},${val.pos[1]}`).childNodes[1];
    // console.log(stone);
    stone.setAttribute("data-stone", STONES_DATA[val.stone]);
    // console.log(val.stone);
    // console.log(stone);
  })
}

function renderPreview(hoverPoint) {
  boardState.forEach(val => {
    let dot = document.getElementById(`${val.pos[0]},${val.pos[1]}`).childNodes[1].childNodes[0];
    console.log();
    dot.setAttribute("data-dot", val.overlay === 'l' && val.pos[0] === hoverPoint.pos[0] && val.pos[1] === hoverPoint.pos[1] ? DOTS_DATA[gameState.turn] : DOTS_DATA[0]);

  })
}

  // functions
  // initialize game
  // set handicap stones
  // render
  // render board
  //render moves
  //render preview
  // render captures
  // render player turn marker
  // game-end
  // render dead group suggestion 
  // render territory counts
  // checkLegalMove
  // clear overlay
  // if move is not '0', move is illegal (opposing player or 'k' for ko)
  // iterate through neighboring points in clockwise order
  // if anyone is '0' move is legal - call render preview
  // if neighboring point is opposing player
  // cycle through opposing player group marking points as overlay: 'chk' when checked and 
  // overlay: 'hold' if they are neighboring points of opposing player color
  // if any neighboring point is '0' terminate cycle and move to next neighboring point of original move
  // if there are unchecked points of 'hold' return
  // if no boardState: 0 points, move is legal overlay: 'l'
  // set all 'chk' to 'x' to represent stones that will be captured upon move
            // if neighboring point is player's
                // cycle through player group marking points as overlay: 'chk' || 'hold'
                // if any neighboring point is '0' ternminate cycle and mark point as 'l'
    // set move
        // if checkLegalMove has returned '0' i2llegal move message?
        // if move state is 'l' 
            // push boardState to lastState
            // push 'l' move to boardState
            // resolve captures
                // for all 'x' in overlay 
                    // count number and add to playerCaptures
                    // set boardState to '0'
        // pass--
        // push move to game record
    // game record: [ 0: handicapStones Obj, 1: 1stMove([moveState[],moveState[][])]
    // pass() pass++ and player turn to other player
    // gameEnd when pass = 2
        // search empty spaces on board for deadShapes
            //  compare spaces to rotations of deadShapes[...]
            // 'd' if empty spaces 
        // return dead group suggestion
        // users can flip status of any dead group overlay( 1, -1 ) 
        // confirm state
            // calculate score = points in overlay for each player + captures
            // render final board state with dead groups removed
        // log game record
            // stringify according to .sgf format
            // log as text
