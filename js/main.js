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
}

const RANKS = [
  '30k', '29k', '28k', '27k', '26k', '25k', '24k', '23k', '22k', '21k', '20k', 
  '19k', '18k', '17k', '16k', '15k', '14k', '13k', '12k', '11k', '10k', 
  '9k', '8k', '7k', '6k', '5k', '4k', '3k', '2k', '1k', 
  '1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d'
];
// index corresponds to difference in player rank
const KOMI_REC = {
  '9': [
    5.5, 2.5, -0.5, -3.5, -6.5, -9.5, 12.5, 15.5, 18.5, 21.5
  ],
  '13': [
    5.5, 0.5, -5.5, 0.5, -5.5, 0.5, -5.5, 0.5, -5.5, 0.5
  ],
  '19': [
    7.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5
  ]
}

const HANDI_REC = {
  '9': [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ],
  '13': [
    0, 0, 0, 2, 2, 3, 3, 4, 4, 5
  ],
  '19': [
    0, 0, 2, 3, 4, 5, 6, 7, 8, 9
  ]
}

const gameState = {
  winner: null,
  turn: 1, // turn logic depends on handicap stones
  pass: null, // -1 represents state in which resignation has been submitted, not confirmed
  komi: null, // komi depends on handicap stones + player rank
  handicap: null,
  boardSize: 9,
  playerState: {
    bCaptures: null,
    wCaptures: null,
    bScore: null,
    wScore: null
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
const HANDI_PLACE = {
  '9' : [
    0, 0,
    [ [ 7, 3 ], [ 3, 7 ] ], 
    [ [ 7, 7 ], [ 7, 3 ], [ 3, 7 ] ], 
    [ [ 3, 3 ], [ 7, 7 ], [ 3, 7 ], [ 7, 3 ] ] 
  ],
  '13' : [
    0, 0,
    [ [ 4, 9 ], [ 9, 4 ] ],
    [ [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
    [ [ 4, 4 ], [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
    [ [ 7, 7 ], [ 4, 4 ], [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
    [ [ 7, 4 ], [ 4, 7 ], [ 4, 4 ], [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
    [ [ 7, 7 ], [ 7, 4 ], [ 4, 7 ], [ 4, 4 ], [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
    [ [ 9, 7 ], [ 7, 4 ], [ 7, 9 ], [ 4, 7 ], [ 4, 4 ], [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
    [ [ 7, 7 ], [ 9, 7 ], [ 7, 4 ], [ 7, 9 ], [ 4, 7 ], [ 4, 4 ], [ 9, 9 ], [ 4, 9 ], [ 9, 4] ],
  ],
  '19' : [
    0, 0,
    [ [ 4, 16 ], [ 16, 4 ] ],
    [ [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 9, 9 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 9, 4 ], [ 4, 9 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 9, 9 ], [ 9, 4 ], [ 4, 9 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 16, 9 ], [ 9, 4 ], [ 9, 16 ], [ 4, 9 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 9, 9 ], [ 16, 9 ], [ 9, 4 ], [ 9, 16 ], [ 4, 9 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
  ]
};
  
  /*----- app's state (variables) -----*/
let boardState = [];


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
      if (frns[frn].groupMembers.find(stone => stone.getLiberties().find(liberty => liberty !== this))) return true;
      continue;
      }
    }
    cycleTerritory = () => {
      if (this.stone) {
        this.groupMembers.forEach(pt => pt.territory = pt.territory * -1);
      } else {
        this.groupMembers.forEach(pt => {
          switch (pt.territory) {
          case 1:
            pt.territory = -1;
            break;
          case -1:
            pt.territory = 'd';
            break;
          case 'd':
            pt.territory = 1;
            break;
          }
        });
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
document.getElementById('board').addEventListener('mousemove', hoverPreview);
document.getElementById('board').addEventListener('click', clickBoard);
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
document.querySelector('input[name="komi-suggest"]').addEventListener('click', clickKomiSuggestion);
gameHudEl.addEventListener('click', clickGameHud);


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
  if (evt.target.id) {
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
  }
  if (evt.target.name = 'black-rank-certain') gameState.playerMeta.b.rankCertain = !gameState.playerMeta.b.rankCertain;
  if (evt.target.name = 'white-rank-certain') gameState.playerMeta.w.rankCertain = !gameState.playerMeta.w.rankCertain;
  blackRankEl.textContent = RANKS[gameState.playerMeta.b.rank];
  whiteRankEl.textContent = RANKS[gameState.playerMeta.w.rank];
  
}

function clickKomiSuggestion() {
  let sugg = KOMI_REC[Math.abs(gameState.playerMeta.w.rank - gameState.playerMeta.b.rank)];
  let handi = HANDI_REC[Math.abs(gameState.playerMeta.w.rank - gameState.playerMeta.b.rank)];
  gameState.komi = sugg;
  gameState.handicap = handi;
  renderMenu();
}

function clickGameHud() {
  if (gameState.pass > 1 && !gameState.winner) calculateWinner();
  if (gameState.pass < 0) confirmResign();
}

function clickSubmitStart() {
  gameState.playerMeta.b.name = blackNameInputEl.value;
  gameState.playerMeta.w.name = whiteNameInputEl.value;
  initGame();
}

function renderMenu() {
  komiSliderEl.value = sugg;
  blackNameDisplayEl.textContent = gameState.playerMeta.b.name;
  whiteNameDisplayEl.textContent = gameState.playerMeta.w.name;
  blackRankEl.textContent = RANKS[gameState.playerMeta.b.rank];
  whiteRankEl.textContent = RANKS[gameState.playerMeta.w.rank];
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

function startMenu() {
  modalEl.style.visibility = 'visible';
  renderMenu;
}

function clickCloseMenu(evt) {
  evt.stopPropagation();
  if (evt.target.className === "modal") modalEl.style.visibility = 'hidden';
}

function clickResign(evt) {
  if (evt.target.parentElement.id === `${STONES_DATA[gameState.turn]}-caps-space`) playerResign();
}

function playerResign() {
  // display confirmation message\
  gameState.pass = -1;
  gameHudEl.style.visibility = "visible";
  gameHudEl.textContent = "Do you want to resign?";
}

function confirmResign() {
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

function editTerritory(evt) {
  let placement = [ parseInt(evt.target.closest('td').id[0]), parseInt(evt.target.closest('td').id[2]) ];
  let point = findPointFromIdx(placement);
  point.cycleTerritory();
  render();
}

function checkKo(point, cap) {
  if (!point.getLiberties().length && cap.checkNeighbors().filter(stone => stone.stone === gameState.turn * -1) 
    && point.capturing.length === 1) return true;
}

function clickBoard(evt) {
  evt.stopPropagation();
  if (gameState.pass > 1 || gameState.winner) return editTerritory(evt);
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

function initBoard() {
  let i = 0;
  while (i < gameState.boardSize * gameState.boardSize) {
    let point = new Point( Math.floor(i / gameState.boardSize) + 1, i % gameState.boardSize + 1)
    boardState.push(point);
    i++;
  }
  // initHandi();
}

function initHandi() {
  // HANDI_PLACE[gameState.handicap]
}

function getDate() {
  let d = new Date;
  return `${d.getFullYear()}-${String(d.getMonth()+1).charAt(-1)||0}${String(d.getMonth()+1).charAt(-0)}-${String(d.getDate()).charAt(-1)||0}${String(d.getDate()+1).charAt(-0)}`
}
function init() {
  gameState.gameMeta.date = getDate();
  gameState.komi = 5.5; // get komi from player input
  startMenu();
  gameState.winner = null;
  gameState.pass = null;
  // gameState.handicap = ; // get handicap from player input
  gameState.turn = gameState.handicap ? -1 : 1;
  gameState.boardSize = 9;
  gameState.playerState.bCaptures = 0;
  gameState.playerState.wCaptures = 0;
  // get any future meta from player input
  // gameState.playerMeta.b // get from player input
  // gameState.playerMeta.w // get from player input
  gameState.gameRecord = []; // clear game record from previous game
  // gameState.boardState // create board from user input

  //need init player meta
  initBoard();
  // testing board state for moves at [32]
  gameState.turn = 1;
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
  if (gameState.winner && gameState.pass < 2) {
    gameHudEl.style.visibility = 'visible';
    gameHudEl.style.cursor = 'default';
    gameHudEl.textContent = `${gameState.playerMeta[gameState.winner === 1 ? 'b' : 'w'].name} won by resignation`;
  }
  else if (gameState.winner && gameState.pass > 1) { 
    gameHudEl.style.visibility = 'visible';
    gameHudEl.style.cursor = 'default';
    gameHudEl.textContent = `${gameState.playerMeta[gameState.winner === 1 ? 'b' : 'w'].name} won by ${Math.abs(gameState.playerState.wScore - gameState.playerState.bScore)}`;
  } else if (gameState.pass > 1) {
    gameHudEl.style.visibility = 'visible';
    gameHudEl.textContent = 'click to finalize game'
  } else {
    gameHudEl.style.visibility = 'hidden';
  }
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

function calculateWinner() {
  // debugger;
  let whiteTerritory = boardState.reduce((acc, pt) => {
    if (pt.territory === -1 && pt.stone !== -1) {
      return acc = acc + (pt.stone === 0 ? 1 : 2);
    }
    return acc;
  }, 0);
  let blackTerritory = boardState.reduce((acc, pt) => {
    if (pt.territory === 1 && pt.stone !== 1) {
      return acc + (pt.stone === 0 ? 1 : 2);
    }
    return acc;
  }, 0);
  gameState.playerState.wScore =
    gameState.playerState.wCaptures
    + (gameState.komi < 0 ? gameState.komi * -1 : 0)
    + whiteTerritory;
  gameState.playerState.bScore =
    gameState.playerState.bCaptures
    + (gameState.komi > 0 ? gameState.komi : 0)
    + blackTerritory;
  gameState.winner = gameState.playerState.wScore > gameState.playerState.bScore ? -1 : 1;
  gameState.gameRecord.push(`${STONES_DATA[gameState.winner]}: +${Math.abs(gameState.playerState.wScore - gameState.playerState.bScore)}`)
  render();
}

function endGameSetTerritory() {
  let emptyPoints = boardState.filter(pt => !pt.stone);
  emptyPoints.forEach(pt => pt.joinGroup());
  emptyPointSetTerritory(emptyPoints);
  groupsMarkDeadLive();
}

function groupsMarkDeadLive() {
  boardState.filter(pt => (!pt.territory ))
    .forEach(pt => {
      debugger;
      if (pt.groupMembers.some(grpMem => {
        return grpMem.checkNeighbors().some(nbr => nbr.territory === pt.stone && nbr.stone === 0)
      })) {
        pt.groupMembers.forEach(grpMem => grpMem.territory = pt.stone);
      }
    });
  boardState.filter(pt => (!pt.territory)).forEach(pt => {
    pt.territory = pt.stone * -1;
  });  
}

function emptyPointSetTerritory(emptyPoints) {
  emptyPoints.filter(pt => !pt.territory && pt.checkNeighbors().filter(nbr => nbr.stone !== 0))
    .forEach(pt => {
      let b = pt.groupMembers.reduce((acc, grpMem) => {
        let bNbr = grpMem.checkNeighbors().filter(nbr => nbr.stone === 1).length;
        return acc + bNbr;
      }, 0);
      let w = pt.groupMembers.reduce((acc, grpMem) => {
        let wNbr = grpMem.checkNeighbors().filter(nbr => nbr.stone === -1).length;
        return acc + wNbr;
      }, 0);
      pt.groupMembers.forEach(grp => {
        if (Math.abs(b - w) < 4) grp.territory = 'd'
        else grp.territory = b > w ? 1 : -1;
      })
    });
}

function endGame() {
  if (!gameState.winner) endGameSetTerritory()

  
  // join all remaining groups
  // check remaining groups life

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
  render();
}

  // game-end
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
