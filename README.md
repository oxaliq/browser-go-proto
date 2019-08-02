# Go 
#### Minimum Deliverable Product

a working game of go for a 9x9 board that
* displays well on mobile or desktop
* initiates a game with suggested handicap and komi according to rank input
* * displays how to play in open screen
* lets the user know whose turn it is
* lets the user know which moves are legal and calculates those accordingly
* * logs ko
* * implement a search algorithm to avoid moving into dead space
* correctly removes captured stones and adds them to capturing player's score
* logs game record
* allows players to pass or resign
* * ends game upon 2 consecutive passes
* calculates estimated score at game end
* * compares board groups to most common dead shapes
* * allows users to override dead group estimates and submit finalized score to game record
* displays game record as string

stretch goals
* uses stone placement GUI for resign and pass
* maintains a one move game state history for 'undo mismove'
* converts string to .sgf format
* allows users to edit game info mid game
* add stone placement sounds
  
superstretch goals
* allows users to select board size (9x9, 13x13, 19x19)
* allows users to load .sgf main lines
* allow for responsivity in the form of
* * 9x9 games simply stretch with screen size
* * larger games allow small displays one click to zoom before running legal move calculations and move placement

<!-- describe go with images of game-->

<!-- List of technologies used -->

<!-- How to play, link to deploy -->

<!-- roadmap -->