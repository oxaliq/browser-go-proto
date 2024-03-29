/*----- constants -----*/
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

const PLACEMENT_SOUNDS = {
  soft: [
    'audio/go_soft.wav',
    'audio/go_soft_2.wav',
    'audio/go_soft_3.wav',
    'audio/go_soft_4.wav',
    'audio/go_soft_5.wav',
    'audio/go_soft_6.wav',
    'audio/go_soft_7.wav'
  ],
  loud: [
    'audio/go_loud.wav',
    'audio/go_loud_2.wav',
    'audio/go_loud_3.wav',
    'audio/go_loud_4.wav',
  ]
}

const gameState = { // pre-init values (render prior to any player input)
  winner: null,
  turn: null, // turn logic depends on handicap stones
  pass: null, // -1 represents state in which resignation has been submitted, not confirmed
  komi: null, // komi depends on handicap stones + player rank
  handicap: null,
  boardSize: null,
  playerState: {
    bCaptures: null,
    wCaptures: null,
    bScore: null,
    wScore: null
  },
  gameMeta: { // declared at game start and not editable after
    date: null, // contains metadata 
    start: false
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

// index represents handicap placement for different board-sizes, eg handiPlace['9][1] = { (3, 3), (7, 7) }
// last array in each property also used for hoshi rendering 
const HANDI_PLACE = {
  '9' : [
    0, 0,
    [[ 7, 3 ], [ 3, 7 ] ], 
    [ [ 7, 7 ], [ 7, 3 ], [ 3, 7 ] ], 
    [ [ 3, 3 ], [ 7, 7 ], [ 3, 7 ], [ 7, 3 ] ] 
  ],
  '13' : [
    0, 0,
    [ [ 4, 10 ], [ 10, 4 ] ],
    [ [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
    [ [ 4, 4 ], [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
    [ [ 7, 7 ], [ 4, 4 ], [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
    [ [ 7, 4 ], [ 4, 7 ], [ 4, 4 ], [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
    [ [ 7, 7 ], [ 7, 4 ], [ 4, 7 ], [ 4, 4 ], [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
    [ [ 10, 7 ], [ 7, 4 ], [ 7, 10 ], [ 4, 7 ], [ 4, 4 ], [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
    [ [ 7, 7 ], [ 10, 7 ], [ 7, 4 ], [ 7, 10 ], [ 4, 7 ], [ 4, 4 ], [ 10, 10 ], [ 4, 10 ], [ 10, 4] ],
  ],
  '19' : [
    0, 0,
    [ [ 4, 16 ], [ 16, 4 ] ],
    [ [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 10, 10 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 10, 4 ], [ 4, 10 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 10, 10 ], [ 10, 4 ], [ 4, 10 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 16, 10 ], [ 10, 4 ], [ 10, 16 ], [ 4, 10 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
    [ [ 10, 10 ], [ 16, 10 ], [ 10, 4 ], [ 10, 16 ], [ 4, 10 ], [ 4, 4 ], [ 16, 16 ], [ 4, 16 ], [ 16, 4] ],
  ]
};

class Point {
  constructor(x, y) {
    this.pos = [ x, y ]
    this.stone = 0; // this is where move placement will go 0, 1, -1, also contains ko: 'k'
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
    return neighborsArr;
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

/*----- app's state (variables) -----*/
let boardState = [];


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
const dateEl = document.getElementById('date');
const boardSizeEl = document.getElementById('board-size-radio');
const komiDisplayEl = document.getElementById('komi');
const handiDisplayEl = document.getElementById('handicap');
const boardEl = document.querySelector('#board tbody');
const gameStartEl = document.querySelector('input[name="game-start"]');
const komiSuggestEl = document.querySelector('input[name="komi-suggest"]');
const soundPlayerEl = new Audio();
const boardSizeRadioEls = [
  document.querySelectorAll('input[name="board-size"')[0],
  document.querySelectorAll('input[name="board-size"')[1],
  document.querySelectorAll('input[name="board-size"')[2]
];

/*----- event listeners -----*/
document.getElementById('board').addEventListener('mousemove', hoverPreview);
document.getElementById('board').addEventListener('click', clickBoard);
document.getElementById('white-bowl').addEventListener('click',clickPass);
document.getElementById('black-bowl').addEventListener('click',clickPass);
document.getElementById('kifu').addEventListener('click', clickMenuOpen);
document.getElementById('white-caps-space').addEventListener('click', clickResign);
document.getElementById('black-caps-space').addEventListener('click', clickResign);
modalEl.addEventListener('click', clickCloseMenu);
komiSliderEl.addEventListener('change', changeUpdateKomi);
handiSliderEl.addEventListener('change', changeUpdateHandicap);
document.getElementById('player-meta').addEventListener('click', clickUpdatePlayerMeta);
document.getElementById('player-meta').addEventListener('change', clickUpdatePlayerMeta);
komiSuggestEl.addEventListener('click', clickKomiSuggestion);
gameHudEl.addEventListener('click', clickGameHud);
boardSizeEl.addEventListener('click', clickBoardSize);
gameStartEl.addEventListener('click', clickSubmitStart);

/*----- FUNCTIONS ----------------------------------*/
/*----- init functions -----*/
init();

function init() {
  gameState.gameMeta.date = getDate();
  gameState.komi = 5.5;
  gameState.handicap = 0;
  gameState.winner = null;
  gameState.pass = null;
  gameState.boardSize = 19;
  gameState.playerState.bCaptures = 0;
  gameState.playerMeta.b.rank = 21;
  gameState.playerState.wCaptures = 0;
  gameState.playerMeta.w.rank = 21;
  gameState.gameRecord = [];
  boardState = [];
  gameState.gameMeta.start = false;
  startMenu();
};

function getDate() {
  let d = new Date;
  return `${d.getFullYear()}-${String(d.getMonth()+1).charAt(-1)||0}${String(d.getMonth()+1).charAt(-0)}-${String(d.getDate()).charAt(-1)||0}${String(d.getDate()+1).charAt(-0)}`
}

function startMenu() {
  modalEl.style.visibility = 'visible';
  renderMenu();
}
function clickSubmitStart(evt) {
  if (gameState.gameMeta.start) return init();
  evt.preventDefault();
  evt.stopPropagation();
  gameState.playerMeta.b.name = blackNameInputEl.value || 'black';
  gameState.playerMeta.w.name = whiteNameInputEl.value || 'white';
  modalEl.style.visibility = 'hidden';
  initGame();
}

function initGame() {
  gameState.winner = null;
  gameState.pass = null;
  gameState.turn = gameState.handicap ? -1 : 1;
  gameState.gameMeta.start = true;
  initBoard();
  renderBoardInit();
  renderGame();
}

function initBoard() {
  let i = 0;
  while (i < gameState.boardSize * gameState.boardSize) {
    let point = new Point( Math.floor(i / gameState.boardSize) + 1, i % gameState.boardSize + 1)
    boardState.push(point);
    i++;
  }
  initHandi();
}

function initHandi() {
  if (gameState.handicap < 2) return;
  HANDI_PLACE[gameState.boardSize][gameState.handicap].forEach(pt => {
    if (!pt) return;
    let handi = findPointFromIdx(pt);
    handi.stone = 1;
    handi.joinGroup();
  })
}

/*----- meta functions -----*/

// include save function
  // unpack existing gamerecords
  // globalGameRecord = JSON.parse(localStorage.getItem('browser-go-saved-games'));
  // append current game record to globalGameRecord - globalGameRecord.gameName = gameState
  // stringify all stored gamerecords JSON.stringify(globalGameRecord)
  // localStorage.clear()
  // localStorage.setItem('browser-go-saved-games')

// load function
  // unpack existing gamerecords - globalGameRecord = JSON.parse(localStorage.getItem('browser-))
  // display each game record name - Object.keys(globalGameRecord).forEach( ... )
  // upon user selection initgame from gameState meta data

// undo last move
  // set up gameState var to track number of 'misclicks'
  // after every move JSON.stringify(localGameRecord)
  // localStorage.clear()
  // localStorage.setItem()
  // on undo click - load JSON.parse(localStorage.getItem())
  // reset gameState

// plus general purpose

function findPointFromIdx(arr) {
  return pointFromIdx = boardState.find( point => point.pos[0] === arr[0] && point.pos[1] === arr[1] );
}

function changeUpdateKomi(evt) {
  evt.stopPropagation();
  komiDisplayEl.textContent = komiSliderEl.value;
  gameState.komi = komiSliderEl.value;
  renderMenu();
}

function changeUpdateHandicap(evt) {
  evt.stopPropagation();
  handiDisplayEl.textContent = handiSliderEl.value  !== 1 ? handiSliderEl.value : 0;
  gameState.handicap = handiSliderEl.value !== 1 ? handiSliderEl.value : 0;
  renderMenu();
}

function clickUpdatePlayerMeta(evt) {
  evt.stopPropagation();
  if (evt.target.id) {
    switch (evt.target.id) {
      case 'black-rank-up':
        if (gameState.playerMeta.b.rank < RANKS.length - 1)  gameState.playerMeta.b.rank++;
        break;
      case 'black-rank-down':
        if (gameState.playerMeta.b.rank > 0) gameState.playerMeta.b.rank--;
        break;
      case 'white-rank-up':
        if (gameState.playerMeta.w.rank < RANKS.length - 1) gameState.playerMeta.w.rank++;
        break;
      case 'white-rank-down':
        if (gameState.playerMeta.w.rank > 0) gameState.playerMeta.w.rank--;
        break;
    }
  }
  if (evt.target.name = 'black-rank-certain') gameState.playerMeta.b.rankCertain = !gameState.playerMeta.b.rankCertain;
  if (evt.target.name = 'white-rank-certain') gameState.playerMeta.w.rankCertain = !gameState.playerMeta.w.rankCertain;
  renderMenu();
  
}

function clickBoardSize(evt) {
  evt.stopPropagation();
  gameState.boardSize = boardSizeRadioEls.find(el => el.checked === true).value;
  renderMenu();
}

function clickKomiSuggestion(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  if (gameState.gameMeta.start) {
    gameState.playerMeta.b.name = blackNameInputEl.value || 'black';
    gameState.playerMeta.w.name = whiteNameInputEl.value || 'white';
    modalEl.style.visibility = 'hidden';
    return 
  }
  let sugg = KOMI_REC[gameState.boardSize][Math.abs(gameState.playerMeta.w.rank - gameState.playerMeta.b.rank)];
  let handi = HANDI_REC[gameState.boardSize][Math.abs(gameState.playerMeta.w.rank - gameState.playerMeta.b.rank)];
  gameState.komi = sugg;
  gameState.handicap = handi;
  renderMenu();
}

function clickCloseMenu(evt) {
  evt.stopPropagation();
  if (evt.target.className === "modal" && gameState.gameMeta.start) modalEl.style.visibility = 'hidden';
}

/*----- gameplay functions -----*/

function clickBoard(evt) {
  evt.stopPropagation();
  if (gameState.pass > 1 || gameState.winner) return editTerritory(evt);
  // checks for placement and pushes to cell
  let placement = [ parseInt(evt.target.closest('td').id.split('-')[0]), parseInt(evt.target.closest('td').id.split('-')[1]) ];
  let point = findPointFromIdx(placement);
  //checks that this placement was marked as legal
  if ( !checkLegal(point) ) return;
  clearKo();
  clearPass();
  resolveCaptures(point);
  point.stone = gameState.turn;
  point.joinGroup();
  playSound(point);
  clearCaptures();
  gameState.gameRecord.push(`${STONES_DATA[gameState.turn]}: ${point.pos}`)
  gameState.turn*= -1;
  renderGame();
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

function resolveCaptures(point) {
  if(!point.capturing.length) {
    point.checkCapture();
  }
  if(point.capturing.length) {
    point.capturing.forEach(cap => {
      gameState.playerState[gameState.turn > 0 ? 'bCaptures' : 'wCaptures']++;
      cap.stone = checkKo(point) ? 'k' : 0;
      cap.groupMembers = [];
    })
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

function clearOverlay() {
  for (let point in boardState) {
    point = boardState[point];
    point.legal = false;
  }
}

// 
function checkKo(point) { // currently prevents snapback // capturing point has no liberties and is only capturing one stone and 
  if (!point.getLiberties().length && point.capturing.length === 1 && !point.checkNeighbors().some(stone => stone.stone === gameState.turn)) return true;
}

function playSound(point) { //plays louder sounds for tenuki and for captures
  if (point.capturing.length || (gameState.boardSize === 19 && gameState.gameRecord.length > 90 && point.groupMembers.length === 1)
    || (gameState.boardSize === 13 && gameState.gameRecord.length > 40 && point.groupMembers.length === 1)) {
      soundPlayerEl.src = PLACEMENT_SOUNDS.loud[Math.floor(Math.random() * 5)];
      soundPlayerEl.play();
    } else {
      soundPlayerEl.src = PLACEMENT_SOUNDS.soft[Math.floor(Math.random() * 8)];
      soundPlayerEl.play();
    }
}

function clearCaptures() {
  for (let point in boardState) {
    point = boardState[point];
    point.capturing = [];
  }
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
  renderGame();
}

function clickMenuOpen() {
  modalEl.style.visibility = 'visible';
  renderMenu();
}

function hoverPreview(evt) {
  evt.stopPropagation();
  if (gameState.pass > 1 || gameState.winner) return;
  // renders preview stone if move is legal
  let hover = evt.target.closest('td').id.split('-');
  hover = [parseInt(hover[0]), parseInt(hover[1])]
  let point = findPointFromIdx(hover);
  if (checkLegal(point)) {
    point.legal = true; // legal
    renderPreview(point);
  }
}

/*----- render functions ----------------------*/
/*----- meta render -----*/

function renderMenu() {
  dateEl.textContent = gameState.gameMeta.date;
  if (gameState.gameMeta.start) {
    gameStartEl.value = "New Game";
    komiSuggestEl.value = "Close Menu";
  }
  renderKomiSlider()
  renderHandiSlider();
  renderBoardSizeRadio();
  blackRankEl.textContent = RANKS[gameState.playerMeta.b.rank];
  whiteRankEl.textContent = RANKS[gameState.playerMeta.w.rank];
}

function renderKomiSlider() {
  komiSliderEl.value = gameState.komi;
  komiDisplayEl.textContent = gameState.komi;
  if (gameState.gameMeta.start) komiSliderEl.setAttribute('disabled', true);
}

function renderHandiSlider() {
  handiSliderEl.value = gameState.handicap;
  handiDisplayEl.textContent = gameState.handicap;
  if (gameState.gameMeta.start) handiSliderEl.setAttribute('disabled', true);
}

function renderBoardSizeRadio() {
  boardSizeEl.value = gameState.boardSize;
  if (gameState.gameMeta.start) boardSizeRadioEls.forEach(el => el.setAttribute('disabled', true));
}

/*----- game render -----*/

function renderBoardInit() {
  renderClearBoard();
  renderBoardTableRows();
  renderHoshi();
  renderBoardTableStyle();
}

function renderClearBoard() {
  boardEl.innerHTML = '';
  boardEl.classList = '';
}

function renderBoardTableRows() {
  let i = 1;
  while (i <= gameState.boardSize) {
    let tableRow = document.createElement('tr');
    tableRow.id = `row-${i}`;
    tableRow.innerHTML = renderBoardTableCells(i);
    boardEl.appendChild(tableRow);
    i++
  }
  boardEl.classList = `board-${gameState.boardSize}x${gameState.boardSize}`;
}

// iterator ^ becomes x index ̌
function renderBoardTableCells(x) {
  let y = 1
  let cells = '';
  while (y <= gameState.boardSize) {
    let newCell = `
    <td id="${x}-${y}">
      <div class="stone">
        <div class="dot"></div>
      </div>
    </td>
    `;
    cells = cells + newCell;
    y++;
  }
  return cells;
}

function renderHoshi() { // gets hoshi placement from handiplace const and adds a class to dot elem
  let hoshi = HANDI_PLACE[gameState.boardSize].slice(-1);
  hoshi = hoshi[0]
  hoshi.forEach(star => {
    let boardPt = document.getElementById(`${star[0]}-${star[1]}`).getElementsByClassName('stone')[0];
    boardPt.className += ' hoshi' });
}

function renderBoardTableStyle() {
  document.querySelectorAll('#board-space td[id^="1-"]').forEach(pt => pt.className += 'top ');
  document.querySelectorAll(`#board-space td[id^="${gameState.boardSize}-"]`).forEach(pt => pt.className += 'btm ');
  document.querySelectorAll('#board-space td[id$="-1"]').forEach(pt => pt.className += 'lft ');
  document.querySelectorAll(`#board-space td[id$="-${gameState.boardSize}"]`).forEach(pt => pt.className += 'rgt ');
}

function renderGame() {
  if (gameState.winner || gameState.pass > 1) {
    renderTerritory();
    renderMessage();
  }
  blackNameDisplayEl.textContent = 
  `${gameState.playerMeta.b.name},
  ${RANKS[gameState.playerMeta.b.rank]}`;
  whiteNameDisplayEl.textContent = 
  `${gameState.playerMeta.w.name},
  ${RANKS[gameState.playerMeta.w.rank]}`;
  gameState.gameRecord.length ? renderTurn() : renderFirstTurn();
  renderBoardState();
  renderCaps();
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

function renderBoardState() {
  boardState.forEach(val => {
    let stoneElem = document.getElementById(`${val.pos[0]}-${val.pos[1]}`).getElementsByClassName('stone')[0];
    stoneElem.setAttribute("data-stone", STONES_DATA[val.stone]);
  })
}

function renderCaps() {
  blackCapsEl.textContent = gameState.playerState.bCaptures;
  whiteCapsEl.textContent = gameState.playerState.wCaptures;
}

function renderPreview(hoverPoint) {
  boardState.forEach(val => {
    let dot = document.getElementById(`${val.pos[0]}-${val.pos[1]}`).getElementsByClassName('dot')[0];
    dot.setAttribute("data-dot", val.legal === true && val.pos[0] === hoverPoint.pos[0] && val.pos[1] === hoverPoint.pos[1] 
    ? DOTS_DATA[gameState.turn] : DOTS_DATA[0]);
  })
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
    gameHudEl.textContent = `${gameState.playerMeta[gameState.winner === 1 ? 'b' : 'w'].name || STONES_DATA[gameState.winner]} won by ${Math.abs(gameState.playerState.wScore - gameState.playerState.bScore)}`;
  } else if (gameState.pass > 1) {
    gameHudEl.style.visibility = 'visible';
    gameHudEl.textContent = 'finalize game'
  } else {
    gameHudEl.style.visibility = 'hidden';
  }
}

function renderTerritory() {
  boardState.forEach(val => {
    let stoneElem = document.getElementById(`${val.pos[0]}-${val.pos[1]}`).getElementsByClassName('dot')[0];
    stoneElem.setAttribute("data-dot", DOTS_DATA[val.territory]);
  })
}

/*----- endgame functions -----*/

function clickResign(evt) {
  if (evt.target.parentElement.id === `${STONES_DATA[gameState.turn]}-caps-space`) playerResign();
}

function playerResign() {
  // display confirmation message
  gameState.pass = -1;
  gameHudEl.style.visibility = "visible";
  gameHudEl.textContent = "Do you want to resign?";
}

function clickGameHud() {
  if (gameState.pass > 1 && !gameState.winner) calculateWinner();
  if (gameState.pass < 0) confirmResign();
}

function confirmResign() {
  gameState.gameRecord.push(`${STONES_DATA[gameState.turn]}: resign`);
  gameState.winner = STONES_DATA[gameState.turn * -1];
  endGame();
}

function endGame() {
  if (!gameState.winner) endGameSetTerritory()
  renderGame();
}

function editTerritory(evt) {
  let placement = [ parseInt(evt.target.closest('td').id.split('-')[0]), parseInt(evt.target.closest('td').id.split('-')[1]) ];
  let point = findPointFromIdx(placement);
  point.cycleTerritory();
  renderGame();
}

function calculateWinner() {
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
  renderGame();
}

function endGameSetTerritory() {
  let emptyPoints = boardState.filter(pt => !pt.stone);
  emptyPoints.forEach(pt => pt.joinGroup());
  emptyPointSetTerritory(emptyPoints);
  groupsMarkDeadLive();
  // reviseTerritory();
}

function groupsMarkDeadLive() {
  boardState.filter(pt => (!pt.territory ))
    .forEach(pt => {
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
        if (Math.abs(b - w) < 4 && b && w) grp.territory = 'd'
        else grp.territory = b > w ? 1 : -1;
      })
    });
}

function reviseTerritory() {
  // count eyes
    // for each group marked live get liberties
      // 
}
