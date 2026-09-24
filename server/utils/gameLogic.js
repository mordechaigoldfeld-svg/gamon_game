function createInitialBoard() {
 
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



function pointToIndex(point, color) {
  return color === "white" ? point - 1 : 24 - point;
}

function calculateDestination(from, die, color) {
  return color === "white" ? from - die : from + die;
}

function getBarDestination(die, color) {
  return color === "white" ? 24 - die : die - 1;
}

function distanceToExit(index, color) {
  return color === "white" ? index + 1 : 24 - index;
}

function isOpenPoint(board, targetIndex, myColor) {

  if (targetIndex < 0 || targetIndex > 23) return false;

  const point = board[targetIndex];

  
  if (point.owner === null || point.checkers === 0) return true;

 
  if (point.owner === myColor) return true;

 
  if (point.owner !== myColor && point.checkers === 1) return true;

  
  return false;
}


function canBearOff(board, bar, color) {

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




const rooms = new Map()

rooms.set("ABC234",
  {id:"ABC234",status: "waiting", // waiting | playing | finished
  ownerSocketId: "socket-1",
  players: [
    { socketId: "socket-1", name: "Dana", color: "white" }
  ],
  game: null,
  rematchAcceptedBy: []
}
)


console.log(rooms.has('ABC234'));
