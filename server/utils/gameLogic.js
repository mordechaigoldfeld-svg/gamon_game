export function createInitialBoard() {
 
  const board = Array.from({ length: 24 }, () => ({
    owner: null,
    checkers: 0
  }));

 
  board[23] = { owner: "white", checkers: 2 };
  board[12] = { owner: "white", checkers: 5 };
  board[7]  = { owner: "white", checkers: 3 };
  board[5]  = { owner: "white", checkers: 5 };


  board[0]  = { owner: "black", checkers: 2 };
  board[11] = { owner: "black", checkers: 5 };
  board[16] = { owner: "black", checkers: 3 };
  board[18] = { owner: "black", checkers: 5 };

  return board;
}

// console.log(createInitialBoard());



export function pointToIndex(point, color) {
  return color === "white" ? point - 1 : 24 - point;
}

export function calculateDestination(from, die, color) {
  return color === "white" ? from - die : from + die;
}

export function getBarDestination(die, color) {
  return color === "white" ? 24 - die : die - 1;
}

export function distanceToExit(index, color) {
  return color === "white" ? index + 1 : 24 - index;
}

export function isOpenPoint(board, targetIndex, myColor) {

  if (targetIndex < 0 || targetIndex > 23) return false;

  const point = board[targetIndex];

  
  if (point.owner === null || point.checkers === 0) return true;

 
  if (point.owner === myColor) return true;

 
  if (point.owner !== myColor && point.checkers === 1) return true;

  
  return false;
}


export function canBearOff(board, bar, color) {

  if (bar[color] > 0) return false;

  if (color === "white") {
 
    for (let i = 6; i <= 23; i++) {
      if (board[i].owner === "white" && board[i].checkers > 0) {
        return false; 
      }
    }
  } else {
  
    for (let i = 0; i <= 17; i++) {
      if (board[i].owner === "black" && board[i].checkers > 0) {
        return false; 
      }
    }
  }


  return true;
}

export function createInitialGame() {
  return {
    board: createInitialBoard(),
    currentPlayer: "white", 
    dice: [],               
    remainingDice: [],      
    bar: { white: 0, black: 0 },
    off: { white: 0, black: 0 },
    winner: null,
    hasRolled: false        
  };
}






export function getLegalMoves(game) {
  const { board, currentPlayer, remainingDice, bar } = game;
  const moves = [];

  if (!remainingDice || remainingDice.length === 0) {
    return moves;
  }

  const uniqueDice = [...new Set(remainingDice)];


  if (bar[currentPlayer] > 0) {
    for (const die of uniqueDice) {
      const targetIndex = getBarDestination(die, currentPlayer);
      if (isOpenPoint(board, targetIndex, currentPlayer)) {
        moves.push({ from: "bar", to: targetIndex, die });
      }
    }
    return moves;
  }

 
  for (let from = 0; from < 24; from++) {
    if (board[from].owner === currentPlayer && board[from].checkers > 0) {
      for (const die of uniqueDice) {
        const targetIndex = calculateDestination(from, die, currentPlayer);
        if (targetIndex >= 0 && targetIndex <= 23) {
          if (isOpenPoint(board, targetIndex, currentPlayer)) {
            moves.push({ from, to: targetIndex, die });
          }
        }
      }
    }
  }


  if (canBearOff(board, bar, currentPlayer)) {
    for (const die of uniqueDice) {

      for (let from = 0; from < 24; from++) {
        if (board[from].owner === currentPlayer && board[from].checkers > 0) {
          const dist = distanceToExit(from, currentPlayer);
          if (die === dist) {
            moves.push({ from, to: "off", die });
          }
        }
      }

      for (let from = 0; from < 24; from++) {
        if (board[from].owner === currentPlayer && board[from].checkers > 0) {
          const dist = distanceToExit(from, currentPlayer);
          if (die > dist) {
            const hasCheckerFurther = checkCheckerFurther(board, currentPlayer, dist);
            if (!hasCheckerFurther) {
              moves.push({ from, to: "off", die });
            }
          }
        }
      }
    }
  }

  return moves;
}


function checkCheckerFurther(board, color, currentDistance) {
  if (color === "white") {
    for (let i = 0; i <= 5; i++) {
      if (board[i].owner === "white" && board[i].checkers > 0 && (i + 1) > currentDistance) {
        return true;
      }
    }
  } else {
    for (let i = 18; i <= 23; i++) {
      if (board[i].owner === "black" && board[i].checkers > 0 && (24 - i) > currentDistance) {
        return true;
      }
    }
  }
  return false;
}


export function applyMove(game, move) {
  const { from, to, die } = move;
  const player = game.currentPlayer;
  const opponent = player === "white" ? "black" : "white";


  if (from === "bar") {
    game.bar[player]--;
  } else {
    game.board[from].checkers--;
    if (game.board[from].checkers === 0) {
      game.board[from].owner = null;
    }
  }


  if (to === "off") {
    game.off[player]++;
  } else {
  
    if (game.board[to].owner === opponent && game.board[to].checkers === 1) {
      game.bar[opponent]++;
      game.board[to].checkers = 1;
      game.board[to].owner = player;
    } else {
  
      game.board[to].owner = player;
      game.board[to].checkers++;
    }
  }


  const dieIndex = game.remainingDice.indexOf(die);
  if (dieIndex !== -1) {
    game.remainingDice.splice(dieIndex, 1);
  }


  if (game.off[player] === 15) {
    game.winner = player;
  }

  return game;
}


// const rooms = new Map()

// rooms.set("ABC234",
//   {id:"ABC234",status: "waiting", // waiting | playing | finished
//   ownerSocketId: "socket-1",
//   players: [
//     { socketId: "socket-1", name: "Dana", color: "white" }
//   ],
//   game: null,
//   rematchAcceptedBy: []
// }
// )


// console.log(rooms.has('ABC234'));
