// global constants declared

    // boardState, lastState, overlay (copy of boardState holding pre-move object, game end group state) 
    // bCaptures, wCaptures, gameInfo object, playerInfo object, turn, pass, gameRecord, 
    // handicapStones, deadShapes{}


// define initial game state

    // define boardState and overlay as 2d 9x9 arrays
    // boardState accepts values of 0, 1, -1
    // overlay accepts values of 0, 1, -1, 'k', 'd', 'chk', 'hold', 'l', 'x'
        // 'k' represents komi, in-game integers represent move previews, 
        // 'chk', 'hold', 'x' and 'l' represent points checked during checkLegalMove run
        // game-end integer represent points of territory, 'd' represents dame,


// cached elements
    // store #menu for displaying game info
    // store 


// set event listeners
    // input listeners for player names, ranks, rank certainty (editable during game)
        //input lister for handicap + komi (only editable pre-game)
    // ::hover-over on board to preview move (with legal move logic)
    // click on board to play move
    // ::hover-over on either bowl for pass, one-level undo options (CSS implementation)
    // click on menu items 
    // click on kifu to display game menu

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
