import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { randomCode,randomDie } from './utils/randomcode.js'
import { isSocketInRoom, createRoom, deleteRoom, getRoomBySocketId, joinRoom, validatePlayerName, isRoomExists } from './roomMennager.js'
import { createInitialGame,getLegalMoves,applyMove } from './utils/gameLogic.js'




const app = express()

const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173']
    }
})







io.on('connect', (socket) => {
    console.log('connected by id', socket.id)

    socket.on('disconnect', () => {
        console.log('disconnected id:', socket.id)
    })

    socket.on('room:create', ({ name }, callback) => {
        if (!validatePlayerName(name)) {
            return callback({ error: 'invalid name' })
        }
        if (isSocketInRoom(socket.id)) {
            return callback({ error: 'you alrredy join in some room' })
        }
        let random = randomCode()

        while (isRoomExists(random)) {
            random = randomCode()
        }
        const room = createRoom(random, socket.id, name)
        socket.join(random)
        callback({
            success: true,
            room: { id: room.id, status: room.status, players: room.players.map(p => ({ name: p.name, color: p.color })) }, yourColor: "white"
        })
        console.log(`player:${socket.id} playing in room ${random}`);

    })
    socket.on('room:join', ({ roomCode, name }, callback) => {
        if (isSocketInRoom(socket.id)) {
            return callback({ error: 'you are already in a room' })
        }
        const result = joinRoom(roomCode, socket.id, name)

        if (result.error) {
            return callback({ error: result.error })
        }
        const {room,cleanCode}=result

        socket.join(cleanCode)


        room.status = 'playing'
        room.game = createInitialGame()

        const publicRoomState = {
        id: room.id,
        status: room.status,
        players: room.players.map(p => ({ name: p.name, color: p.color }))
    }

    
    callback({
        success: true,
        room: publicRoomState,
        yourColor: 'black'
    })

    io.to(cleanCode).emit('room:state', publicRoomState)
    io.to(cleanCode).emit('game:start', { game: room.game })

    console.log(`player:${socket.id} joined room ${cleanCode}`)
    })
    socket.on('game:rollDice', (_, callback) => {
        const room = getRoomBySocketId(socket.id)
        if (!room || !room.game) {
            return callback?.({ error: 'game not found' })
        }

        const game = room.game

       
        const player = room.players.find(p => p.socketId === socket.id)
        if (!player) {
            return callback?.({ error: 'player not in room' })
        }

     
        if (game.currentPlayer !== player.color) {
            return callback?.({ error: 'not your turn' })
        }

      
        if (game.hasRolled) {
            return callback?.({ error: 'already rolled dice this turn' })
        }

     
        const die1 = randomDie()
        const die2 = randomDie()
        game.dice = [die1, die2]
        game.hasRolled = true

    
        if (die1 === die2) {
            game.remainingDice = [die1, die1, die1, die1]
        } else {
            game.remainingDice = [die1, die2]
        }


        const legalMoves = getLegalMoves(game)

        callback?.({ success: true, dice: game.dice, legalMoves })


        io.to(room.id).emit('game:diceRolled', {
            dice: game.dice,
            currentPlayer: game.currentPlayer,
            remainingDice: game.remainingDice
        })

        console.log(`Room ${room.id}: ${player.name} (${player.color}) rolled [${game.dice}]`)
    })


})


server.listen(3030, () => {
    console.log('server runing...')
})