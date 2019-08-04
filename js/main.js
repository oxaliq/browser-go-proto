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
let boardState;


  // define initial game state
  
class Point {
  constructor(x, y) {
    this.pos = [ x, y ]
    this.stone = 0; // this is where move placement will go 0, 1, -1 'k'
    this.legal;
    this.chk = false; // this is where 'chk', 'l'
    this.neighbors = {
      top: {},
      btm: {},
      lft: {},
      rgt: {}
    }
    this.neighbors.top = x > 1 ? [ x - 1, y ] : null;
    this.neighbors.btm = x < gameState.boardSize ? [ x + 1, y ] : null;
    this.neighbors.rgt = y > 1 ? [ x, y - 1 ] : null;
    this.neighbors.lft = y < gameState.boardSize ? [ x, y + 1 ] : null;
  } 
  // first 
  checkNeighbors = () => {
    let neighborsArr = [];
    for ( let neighbor in this.neighbors ) {
      let nbr = this.neighbors[neighbor];
      // console.log(nbr);
      // neighbor exists it's point is stored as { rPos, cPos}
      if ( nbr !== null ) {
      neighborsArr.push(boardState.find( val =>  val.pos[0] === nbr[0] && val.pos[1] === nbr[1] ))
      }
    };
    // returns array of existing neighbors to calling function
    return neighborsArr;
  }
  emptyNeighbor = () => {
    let neighborsArr = this.checkNeighbors();
    return neighborsArr.find(val => val.stone === 0 && !val.chk ); //checked
    // return true if neighboring point is empty;
  }
  checkCapture = () => {
    // console.log(this)
    return this.findStone(gameState.turn * -1).filter(val => !val.emptyNeighbor());
  }
  // returns all opposing neighbors that do not have an opposing neighbor
  checkGroup = () => {
    return this.findStone(gameState.turn).filter(val => val.emptyNeighbor());
    // returns first friendly neighbor that has an empty neighbor
  } 
  findStone = (stone) => {
    return this.checkNeighbors().filter(val => {
      if ( val.stone === (stone) ) return val;
    });
     //returns an array of neighbors for the value of stone
  }
}
// could use this Array to iterate through and create 
// let boardCreator = new Array(gameState.boardSize).fill(gameState.boardSize);
// boardState [point objects-contain overlay] lastState (created from boardState)

// 'k' represents komi, in-game integers represent move previews, 
// 'chk', 'hold', 'x' and 'l' represent points checked during checkLegalMove run
// game-end integer represent points of territory, 'd' represents dame,


/*----- cached element references -----*/
// store modal #menu for displaying game info
// store 


/*----- event listeners -----*/
// input listeners for player names, ranks, rank certainty (editable during game)
//input lister for handicap + komi (only editable pre-game)
// ::hover-over on board to preview move (with legal move logic)
document.getElementById('board').addEventListener('mousemove', hoverPreview);
// click on board to play move
document.getElementById('board').addEventListener('click', placeStone);
// ::hover-over on either bowl for pass, one-level undo options (CSS implementation)
// click on menu items 
// click on kifu to display game menu

/*----- functions -----*/
init();

let findPointFromIdx = (arr) => boardState.find( point => point.pos[0] === arr[0] && point.pos[1] === arr[1] );

function hoverPreview(evt) {
  // renders preview stone if move is legal
  let hover = [ parseInt(evt.target.closest('td').id[0]), parseInt(evt.target.closest('td').id[2]) ];
  let point = findPointFromIdx(hover);
  if (checkLegal(point)) {
    point.legal = true; // legal
    render(point);
  }
}

function checkLegal(point) {
  clearOverlay();
  // first step in logic: is point occupied, or in ko
  point.chk = true; //check
  if (point.stone) return false;
  // console.log('getting here')
  // if point is not empty check if neighboring point is empty
  if (!point.emptyNeighbor()) {
    // console.log('getting here')
    //if neighboring point is not empty check if enemy group is captured
    if ( point.checkCapture().length ) return true;
    // console.log('getting here')
    //if neighboring point is not empty check if friendly group is alive
    if ( point.checkGroup().length ) return true;
    // console.log('getting here')
    return false;
  }
  // console.log('getting here')
  render(point);
  return true;
}

function clearOverlay() { //legal and check
  for (let point in boardState) {
    point = boardState[point];
    point.chk = false;
    point.legal = false;
  }
}

function resolveCaptures(point) {
  if( point.checkCapture().length ) {
    let caps = point.checkCapture()
    for (opp in caps) {
      opp = caps[opp];
      gameState.playerState[opp.stone > 0 ? 'bCaptures' : 'wCaptures']++;
      opp.stone = checkKo(opp, point) ? 'k' : 0;
      console.log(checkKo(opp,point))
    }
  }
}

function checkKo(cap, point) {
  return cap.findStone(gameState.turn).length === 4 && !point.emptyNeighbor();//determines ponnuki
}

function placeStone(evt) {
  // checks for placement and pushes to cell
  let placement = [ parseInt(evt.target.closest('td').id[0]), parseInt(evt.target.closest('td').id[2]) ];
  let point = findPointFromIdx(placement);
  //checks that this placement was marked as legal
  if ( !checkLegal(point) ) return;
  point.stone = gameState.turn;
  clearKoClearPass();
  resolveCaptures(point);
  gameState.turn*= -1;
  render();
}

function clearKoClearPass() {
  for (let point in boardState) {
    point = boardState[point];
    point.stone = point.stone === 'k' ? 0 : point.stone;
    gameState.pass = 0;
  }
}

function init() {
  gameState.winner = null;
  gameState.pass = null;
  // gameState.komi = ; // get komi from player input
  // gameState.handicap = ; // get handicap from player input
  // gameState.turn = gameState.handicap ? -1 : 1;
  gameState.playerState.bCaptures = 0;
  gameState.playerState.wCaptures = 0;
  // gameState.gameMeta.date = // get from browser window
  // get any future meta from player input
  // gameState.playerMeta.b // get from player input
  // gameState.playerMeta.w // get from player input
  gameState.gameRecord = []; // clear game record from previous game
  // gameState.boardState // create board from user input
  
  //need init player meta
  
  boardState = [ new Point(1,1), new Point(1,2), new Point(1,3), new Point(1,4), new Point(1,5), new Point(1,6), new Point(1,7), new Point(1,8), new Point(1,9),
  new Point(2,1), new Point(2,2), new Point(2,3), new Point(2,4), new Point(2,5), new Point(2,6), new Point(2,7), new Point(2,8), new Point(2,9),
  new Point(3,1), new Point(3,2), new Point(3,3), new Point(3,4), new Point(3,5), new Point(3,6), new Point(3,7), new Point(3,8), new Point(3,9),
  new Point(4,1), new Point(4,2), new Point(4,3), new Point(4,4), new Point(4,5), new Point(4,6), new Point(4,7), new Point(4,8), new Point(4,9),
  new Point(5,1), new Point(5,2), new Point(5,3), new Point(5,4), new Point(5,5), new Point(5,6), new Point(5,7), new Point(5,8), new Point(5,9),
  new Point(6,1), new Point(6,2), new Point(6,3), new Point(6,4), new Point(6,5), new Point(6,6), new Point(6,7), new Point(6,8), new Point(6,9),
  new Point(7,1), new Point(7,2), new Point(7,3), new Point(7,4), new Point(7,5), new Point(7,6), new Point(7,7), new Point(7,8), new Point(7,9),
  new Point(8,1), new Point(8,2), new Point(8,3), new Point(8,4), new Point(8,5), new Point(8,6), new Point(8,7), new Point(8,8), new Point(8,9),
  new Point(9,1), new Point(9,2), new Point(9,3), new Point(9,4), new Point(9,5), new Point(9,6), new Point(9,7), new Point(9,8), new Point(9,9)
  ];
  render();
};
    
function render(hoverPoint) {
  renderBoard();
  renderPreview(hoverPoint);
}

function renderBoard() {
  boardState.forEach(val => {
    let stone = document.getElementById(`${val.pos[0]},${val.pos[1]}`).childNodes[1];
    stone.setAttribute("data-stone", STONES_DATA[val.stone]);
  })
}

function renderPreview(hoverPoint) {
  boardState.forEach(val => {
    let dot = document.getElementById(`${val.pos[0]},${val.pos[1]}`).childNodes[1].childNodes[0];
    dot.setAttribute("data-dot", val.legal === true && val.pos[0] === hoverPoint.pos[0] && val.pos[1] === hoverPoint.pos[1] ? DOTS_DATA[gameState.turn] : DOTS_DATA[0]);

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
