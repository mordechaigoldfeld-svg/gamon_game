import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { randomCode } from './utils/randomcode.js'
import { isSocketInRoom,createRoom,deleteRoom,getRoomBySocketId,joinRoom,validatePlayerName } from './roomMennager.js'



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
    socket.on('room:create',({name})=>{
        const random = randomCode()
        socket.join(random)
        console.log(`player:${socket.id} playing in room ${random}`);
        
    })
})


server.listen(3030, () => {
    console.log('server runing...')
})