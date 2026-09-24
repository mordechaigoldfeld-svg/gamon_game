import { randomCode } from "./utils/randomcode.js";

const rooms = new Map()

const socketToRoom = new Map()



export function validatePlayerName(name) {
    if (!name || typeof name !== 'string') return false;
    const clean = name.trim();
    return clean.length >= 1 && clean.length <= 20;
}


export function isSocketInRoom(socketId) {
    return socketToRoom.has(socketId)
}


export function isRoomExists(romId){
    return rooms.has(romId)
}
 


export function getRoomBySocketId(socketId) {
    const roomCode = socketToRoom.get(socketId)
    if (!roomCode) return null
    return rooms.get(roomCode)
}



export function createRoom(roomCode, socketId, playerName) {
    const newRoom = {
        id: roomCode,
        status: 'waiting',
        ownerSocketId: socketId,
        players: [
            { socketId, name: playerName.trim(), color: 'white' }
        ],
        game: null,
        rematchAcceptedBy: []

    }

    rooms.set(roomCode, newRoom)
    socketToRoom.set(socketId, roomCode)
    return newRoom
}



export function joinRoom(roomCode, socketId, playerName) {
    if (!roomCode || typeof roomCode !== 'string') {
    return { error: 'invalid room code' }
}
    if (!validatePlayerName(playerName)) {
        return { error: 'invalid name' }
    }
    const cleanCode = roomCode.trim().toUpperCase()
    const room = rooms.get(cleanCode)
    if (!room) {
        return { error: 'code not found' }
    }

    if (room.status !== 'waiting' || room.players.length >= 2) {
        return { error: 'full room the game alrredy starts' }
    }
    room.players.push({
        socketId,
        name: playerName.trim(),
        color: 'black'
    })

    socketToRoom.set(socketId, cleanCode);
    return { room,cleanCode }
}



export function deleteRoom(roomCode) {
    const room = rooms.get(roomCode)
    if (room) {
        room.players.forEach(p => socketToRoom.delete(p.socketId))
        rooms.delete(roomCode)
    }
}
