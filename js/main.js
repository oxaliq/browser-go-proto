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

const RANKS = ['30k', '29k', '28k', '27k', '26k', '25k', '24k', '23k', '22k', '21k', '20k', 
  '19k', '18k', '17k', '16k', '15k', '14k', '13k', '12k', '11k', '10k', 
  '9k', '8k', '7k', '6k', '5k', '4k', '3k', '2k', '1k', 
  '1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d']

const gameState = {
  winner: null,
  turn: 1, // turn logic depends on handicap stones
  pass: null,
  komi: null, // komi depends on handicap stones + player rank
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
      rank: 21, 
      rankCertain: false
    },
    w: {
      name: null,
      rank: 21,
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
    this.territory;
    this.capturing = [];
    this.groupMembers = [ this ];
    this.neighbors = {
      top: {},
      btm: {},
      lft: {},
      rgt: {}
    }
    this.neighbors.top = x > 1 ? [ x - 1, y ] : null;
    this.neighbors.btm = x < gameState.boardSize ? [ x + 1, y ] : null;
    this.neighbors.rgt = y < gameState.boardSize ? [ x, y + 1 ] : null;
    this.neighbors.lft = y > 1 ? [ x, y - 1 ] : null;
  } 
  checkNeighbors = () => {
    let neighborsArr = [];
    for (let neighbor in this.neighbors) {
      let nbr = this.neighbors[neighbor];
      // neighbor exists it's point is stored as { rPos, cPos}
      if ( nbr !== null ) {
      neighborsArr.push(boardState.find(pt =>  pt.pos[0] === nbr[0] && pt.pos[1] === nbr[1]))
      }
    };
    // returns array of existing neighbors to calling function
    return neighborsArr;
  }
  getLiberties = () => { 
    let neighborsArr = this.checkNeighbors().filter(pt => pt.stone === 0);
    return neighborsArr; //checked
    // return all liberties;
  }
  joinGroup = () => {
    this.groupMembers = this.groupMembers.filter(grp => grp.stone === this.stone);
    this.groupMembers.push(this);
    let frns = this.checkNeighbors().filter(nbr => nbr.stone === this.stone);
    for (let frn of frns) {
      this.groupMembers.push(frn);
    }
    this.groupMembers = Array.from(new Set(this.groupMembers));
    for (let grpMem in this.groupMembers) {
      this.groupMembers = Array.from(new Set(this.groupMembers.concat(this.groupMembers[grpMem].groupMembers)));
    }
    for (let grpMem in this.groupMembers) {
      this.groupMembers[grpMem].groupMembers = Array.from(new Set(this.groupMembers[grpMem].groupMembers.concat(this.groupMembers)));
    }
  }
  checkCapture = () => {
    let tempCaptures = [];
    let opps = this.checkNeighbors().filter(nbr => nbr.stone === gameState.turn * -1 
      && nbr.getLiberties().every(liberty => liberty === this));
    for (let opp of opps) {
      if (opp.groupMembers.every(stone => stone.getLiberties().filter(liberty => liberty !== this).length === 0)) {
        this.capturing = this.capturing.concat(opp.groupMembers);
      };
    }
    this.capturing = Array.from(new Set(this.capturing));
    return this.capturing;
  }
  checkGroup = () => { // liberty is true when called by move false when called by check Capture
    let frns = this.checkNeighbors().filter(nbr => nbr.stone === gameState.turn);
    for (let frn in frns) {
      console.log(frns[frn]);
      if (frns[frn].groupMembers.find(stone => stone.getLiberties().find(liberty => liberty !== this))) return true;
      continue;
      }
    }
}
// could use this Array to iterate through and create 
// let boardCreator = new Array(gameState.boardSize).fill(gameState.boardSize);
// boardState [point objects-contain overlay] lastState (created from boardState)

// 'k' represents komi, in-game integers represent move previews, 
// 'chk', 'hold', 'x' and 'l' represent points checked during checkLegalMove run
// game-end integer represent points of territory, 'd' represents dame,


/*----- cached element references -----*/
const whiteCapsEl = document.getElementById('white-caps');
const blackCapsEl = document.getElementById('black-caps');
const modalEl = document.querySelector('.modal');
const komiSliderEl = document.querySelector('input[name="komi-slider"]');
const handiSliderEl = document.querySelector('input[name="handicap-slider"]');
const blackRankEl = document.getElementById('black-rank');
const blackRankUpEl = document.getElementById('black-rank-up');
const blackRankDownEl = document.getElementById('black-rank-down');
const whiteRankEl = document.getElementById('white-rank');
const whiteRankUpEl = document.getElementById('black-rank-up');
const whiteRankDownEl = document.getElementById('black-rank-down');
const blackNameInputEl = document.querySelector('input[name="black-name"]')
const whiteNameInputEl = document.querySelector('input[name="white-name"]')
const blackNameDisplayEl = document.querySelector('h4#black-player-name');
const whiteNameDisplayEl = document.querySelector('h4#white-player-name');
const gameHudEl = document.querySelector('#game-hud p');

// store modal #menu for displaying game info
// store 


/*----- event listeners -----*/
// input listeners for player names, ranks, rank certainty (editable during game)
//input lister for handicap + komi (only editable pre-game)
// ::hover-over on board to preview move (with legal move logic)
document.getElementById('board').addEventListener('mousemove', hoverPreview);
// click on board to play move
document.getElementById('board').addEventListener('click', clickBoard);
// ::hover-over on either bowl for pass, one-level undo options (CSS implementation)
// click on menu items 
// click on kifu to display game menu
document.getElementById('white-bowl').addEventListener('click',clickPass);
document.getElementById('black-bowl').addEventListener('click',clickPass);
document.getElementById('kifu').addEventListener('click', clickMenu);
document.getElementById('white-caps-space').addEventListener('click', clickResign);
document.getElementById('black-caps-space').addEventListener('click', clickResign);
modalEl.addEventListener('click', clickCloseMenu);
komiSliderEl.addEventListener('change', changeUpdateKomi);
handiSliderEl.addEventListener('change', changeUpdateHandicap);
document.getElementById('player-meta').addEventListener('click', clickUpdatePlayerMeta);
document.getElementById('player-meta').addEventListener('change', clickUpdatePlayerMeta);


/*----- functions -----*/
init();

let findPointFromIdx = (arr) => boardState.find( point => point.pos[0] === arr[0] && point.pos[1] === arr[1] );

function changeUpdateKomi() {
  document.getElementById('komi').textContent = komiSliderEl.value;
}

function changeUpdateHandicap() {
  document.getElementById('handicap').textContent = handiSliderEl.value;
}

function clickUpdatePlayerMeta(evt) {
  switch (evt.target.id) {
    case 'black-rank-up':
      gameState.playerMeta.b.rank++;
      break;
    case 'black-rank-down':
        gameState.playerMeta.b.rank--;
        break;
    case 'white-rank-up':
      gameState.playerMeta.w.rank++;
      break;
    case 'white-rank-down':
      gameState.playerMeta.w.rank--;
      break;
  }
  if (evt.target.name = 'black-rank-certain') gameState.playerMeta.b.rankCertain = !gameState.playerMeta.b.rankCertain;
  if (evt.target.name = 'white-rank-certain') gameState.playerMeta.w.rankCertain = !gameState.playerMeta.w.rankCertain;
  blackRankEl.textContent = RANKS[gameState.playerMeta.b.rank];
  whiteRankEl.textContent = RANKS[gameState.playerMeta.w.rank];
  
}

function clickKomiSuggestion() {
  //
}

function clickSubmitStart() {

  gameState.playerMeta.b.name = blackNameInputEl.value;
  gameState.playerMeta.w.name = whiteNameInputEl.value;
  blackNameDisplayEl.textContent = gameState.playerMeta.b.name;
  whiteNameDisplayEl.textContent = gameState.playerMeta.w.name;
}
  
function clickPass(evt) {
  if (evt.target.parentElement.id === `${STONES_DATA[gameState.turn]}-bowl`) playerPass();
}

function playerPass() {
  // display confirmation message
  clearKo();
  clearCaptures();
  gameState.gameRecord.push(`${STONES_DATA[gameState.turn]}: pass`)
  gameState.pass++;
  if (gameState.pass === 2) return endGame();
  gameState.turn*= -1;
  render();
}

function clickMenu() {
  modalEl.style.visibility = 'visible';
  changeUpdateKomi();
  changeUpdateHandicap();
  clickUpdatePlayerMeta();
}

function clickCloseMenu(evt) {
  evt.stopPropagation();
  if (evt.target.className === "modal") modalEl.style.visibility = 'hidden';
}

function clickResign(evt) {
  if (evt.target.parentElement.id === `${STONES_DATA[gameState.turn]}-caps-space`) playerResign();
}

function playerResign() {
  // display confirmation message
  if (!confirm('Do you want to resign?')) return;

  gameState.gameRecord.push(`${STONES_DATA[gameState.turn]}: resign`);
  gameState.winner = STONES_DATA[gameState.turn * -1];
  endGame();
}

function hoverPreview(evt) {
  evt.stopPropagation();
  if (gameState.pass > 1 || gameState.winner) return;
  // renders preview stone if move is legal
  let hover = [ parseInt(evt.target.closest('td').id[0]), parseInt(evt.target.closest('td').id[2]) ];
  let point = findPointFromIdx(hover);
  if (checkLegal(point)) {
    point.legal = true; // legal
    renderPreview(point);
  }
}

function checkLegal(point) {
  clearOverlay();
  // first step in logic: is point occupied, or in ko
  if (point.stone) return false;
  // if point is not empty check if liberties
  if (point.getLiberties().length < 1) {
    //if no liberties check if enemy group has liberties
    if ( point.checkCapture().length ) return true;
    //if neighboring point is not empty check if friendly group is alive
    if (point.checkGroup()) return true;
    return false;
  }
  return true;
}

function clearOverlay() { //legal and check
  for (let point in boardState) {
    point = boardState[point];
    point.legal = false;
  }
}

function resolveCaptures(point) {
  if(!point.capturing.length) {
    point.checkCapture();
  }
  if(point.capturing.length) {
    point.capturing.forEach(cap => {
      gameState.playerState[gameState.turn > 0 ? 'bCaptures' : 'wCaptures']++;
      cap.groupMembers = [];
      cap.stone = checkKo(point, cap) ? 'k' : 0;
    })
  }
}

function checkKo(point, cap) {
  if (!point.getLiberties().length && cap.checkNeighbors().filter(stone => stone.stone === gameState.turn * -1) 
    && point.capturing.length === 1) return true;
}

function clickBoard(evt) {
  evt.stopPropagation();
  if (gameState.pass > 1 || gameState.winner) return;
  // checks for placement and pushes to cell
  let placement = [ parseInt(evt.target.closest('td').id[0]), parseInt(evt.target.closest('td').id[2]) ];
  let point = findPointFromIdx(placement);
  //checks that this placement was marked as legal
  if ( !checkLegal(point) ) return;
  clearKo();
  clearPass();
  resolveCaptures(point);
  point.stone = gameState.turn;
  point.joinGroup();
  clearCaptures();
  gameState.gameRecord.push(`${STONES_DATA[gameState.turn]}: ${point.pos}`)
  gameState.turn*= -1;
  render();
}

function clearKo() {
  for (let point in boardState) {
    point = boardState[point];
    point.stone = point.stone === 'k' ? 0 : point.stone;
  }
}

function clearPass() {
  gameState.pass = 0;
}

function clearCaptures() {
  for (let point in boardState) {
    point = boardState[point];
    point.capturing = [];
  }
}

function getDate() {
  let d = new Date;
  return `${d.getFullYear()}-${String(d.getMonth()+1).charAt(-1)||0}${String(d.getMonth()+1).charAt(-0)}-${String(d.getDate()).charAt(-1)||0}${String(d.getDate()+1).charAt(-0)}`
}
function init() {
  gameState.winner = null;
  gameState.pass = null;
  // gameState.komi = ; // get komi from player input
  // gameState.handicap = ; // get handicap from player input
  // gameState.turn = gameState.handicap ? -1 : 1;
  gameState.playerState.bCaptures = 0;
  gameState.playerState.wCaptures = 0;
  gameState.gameMeta.date = getDate();
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
  // testing board state for moves at [32]
  gameState.turn = 1;

  // boardState[1].stone = 1;
  // boardState[1].joinGroup();
  // boardState[4].stone = 1;
  // boardState[4].joinGroup();
  // boardState[5].stone = 1;
  // boardState[5].joinGroup();
  // boardState[6].stone = 1;
  // boardState[6].joinGroup();
  // boardState[9].stone = 1;
  // boardState[9].joinGroup();
  // boardState[10].stone = -1;
  // boardState[10].joinGroup();
  // boardState[11].stone = 1;
  // boardState[11].joinGroup();
  // boardState[13].stone = -1;
  // boardState[13].joinGroup();
  // boardState[14].stone = -1;
  // boardState[14].joinGroup();
  // boardState[15].stone = -1;
  // boardState[15].joinGroup();
  // boardState[16].stone = 1;
  // boardState[16].joinGroup();
  // boardState[18].stone = 1;
  // boardState[18].joinGroup();
  // boardState[19].stone = -1;
  // boardState[19].joinGroup();
  // boardState[20].stone = 1;
  // boardState[20].joinGroup();
  // boardState[21].stone = 1;
  // boardState[21].joinGroup();
  // boardState[22].stone = 1;
  // boardState[22].joinGroup();
  // boardState[23].stone = -1;
  // boardState[23].joinGroup();
  // boardState[24].stone = 1;
  // boardState[24].joinGroup();
  // boardState[25].stone = 1;
  // boardState[25].joinGroup();
  // boardState[27].stone = 1;
  // boardState[27].joinGroup();
  // boardState[28].stone = -1;
  // boardState[28].joinGroup();
  // boardState[29].stone = -1;
  // boardState[29].joinGroup();
  // boardState[30].stone = -1;
  // boardState[30].joinGroup();
  // boardState[31].stone = -1;
  // boardState[31].joinGroup();
  // boardState[33].stone = -1;
  // boardState[33].joinGroup();
  // boardState[34].stone = 1;
  // boardState[34].joinGroup();
  // boardState[36].stone = 1;
  // boardState[36].joinGroup();
  // boardState[37].stone = -1;
  // boardState[37].joinGroup();
  // boardState[38].stone = 1;
  // boardState[38].joinGroup();
  // boardState[39].stone = 1;
  // boardState[39].joinGroup();
  // boardState[40].stone = 1;
  // boardState[40].joinGroup();
  // boardState[41].stone = -1;
  // boardState[41].joinGroup();
  // boardState[42].stone = 1;
  // boardState[42].joinGroup();
  // boardState[46].stone = 1;
  // boardState[46].joinGroup();
  // boardState[56].stone = 1;
  // boardState[56].joinGroup();
  // boardState[57].stone = 1;
  // boardState[57].joinGroup();
  // boardState[65].stone = -1;
  // boardState[65].joinGroup();
  // boardState[66].stone = -1;
  // boardState[66].joinGroup();
  // boardState[67].stone = 1;
  // boardState[67].joinGroup();
  // boardState[74].stone = -1;
  // boardState[75].stone = -1;
  // boardState[76].stone = 1;


  clearCaptures();
  // end testing board state
  render();
};
    
function render() {
  if (gameState.winner || gameState.pass > 1) {
    renderTerritory();
    renderMessage();
  }
  gameState.gameRecord.length? renderTurn() : renderFirstTurn();
  renderBoard();
  renderCaps();
}

function renderMessage() {
  if (gameState.winner) gameHudEl.textContent = `${gameState.playerMeta[gameState.winner === 1 ? 'b' : 'w'].name} won by resignation`
}

function renderTerritory() {
  boardState.forEach(val => {
    let stoneElem = document.getElementById(`${val.pos[0]}-${val.pos[1]}`).childNodes[1].childNodes[0];
    stoneElem.setAttribute("data-dot", DOTS_DATA[val.territory]);
  })
}

function renderFirstTurn() {
  document.getElementById(`${STONES_DATA[gameState.turn]}-bowl`).toggleAttribute('data-turn');
}
function renderTurn() {
  if (gameState.winner || gameState.pass > 1) document.querySelectorAll(`.bowl`).forEach(bowl => {
    bowl.removeAttribute('data-turn');
    bowl.toggleAttribute('data-turn');

  });
  document.querySelectorAll(`.bowl`).forEach(bowl => bowl.toggleAttribute('data-turn'));
}

function renderBoard() {
  boardState.forEach(val => {
    let stoneElem = document.getElementById(`${val.pos[0]}-${val.pos[1]}`).childNodes[1];
    stoneElem.setAttribute("data-stone", STONES_DATA[val.stone]);
  })
}

function renderCaps() {
  blackCapsEl.textContent = gameState.playerState.bCaptures;
  whiteCapsEl.textContent = gameState.playerState.wCaptures;
}

function renderPreview(hoverPoint) {
  boardState.forEach(val => {
    let dot = document.getElementById(`${val.pos[0]}-${val.pos[1]}`).childNodes[1].childNodes[0];
    dot.setAttribute("data-dot", val.legal === true && val.pos[0] === hoverPoint.pos[0] && val.pos[1] === hoverPoint.pos[1] ? DOTS_DATA[gameState.turn] : DOTS_DATA[0]);

  })
}

function endGameSetTerritory() {
  // boardState.forEach(pt => { 
  //   pt.territory = pt.stone ? pt.stone : 'd'
  // });
  let emptyPoints = boardState.filter(pt => !pt.stone)
  boardState.filter(pt => {
    return pt.groupMembers.length < 6 && pt.stone
  }).forEach(pt => pt.territory = pt.stone * -1);
}

function endGame() {
  if (!gameState.winner)
  endGameSetTerritory()
  
  // join all remaining groups
  // check remaining groups life

        // search empty spaces on board for deadShapes
            //  compare spaces to rotations of deadShapes[...]
            // 'd' if empty spaces 

  render();
        // return dead group suggestion
        // users can flip status of any dead group overlay( 1, -1 ) 
        // confirm state
            // calculate score = points in overlay for each player + captures
            // render final board state with dead groups removed
        // log game record
            // stringify according to .sgf format
            // log as text
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
