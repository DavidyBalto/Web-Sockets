import expres from 'express'

import {Server} from 'socket.io'
import { createServer } from 'node:http'
import { ChatModel } from '../models/SQLocal.js'

const port = process.env.PORT ?? 1234

const app = expres()
const server = new createServer(app)
const io = new Server (server)

io.on('connection', async (socket)=> {
  socket.on('User',async (User)=>{
    await ChatModel.NewUser(User)
  })

  socket.on('chat message',async ({msg, user})=>{
    const LastMsg = await ChatModel.ChatMessage({msg, user})
    io.emit('chat message',{msg, user, serverOffset:LastMsg})
  })

  if(!socket.recovered){
    const result = await ChatModel.RecoverMsg(socket.handshake.auth.serverOffset ?? 0)
    result.forEach(async row=>{
        socket.emit('chat message', 
        {msg:row.message,user:row.userName,serverOffset: row.message_Id}) 
    })
  }
  // socket.on('disconnect', () => {
  //   console.log('Usuario desconectado')
  // });
})

app.get('/', (req, res)=>{
  res.sendFile(process.cwd() + '/client/')
})

server.listen(port, ()=>{
  console.log(`app listening on port http://localhost:${port}`)
})
