import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { randomCode } from './utils/randomcode.js'
import { isSocketInRoom, createRoom, deleteRoom, getRoomBySocketId, joinRoom, validatePlayerName, isRoomExists } from './roomMennager.js'



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

    console.log(`player:${socket.id} joined room ${cleanCode}`)
    })
})


server.listen(3030, () => {
    console.log('server runing...')
})