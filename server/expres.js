import expres from 'express'

import {Server} from 'socket.io'
import { createServer } from 'node:http'
import { ChatModel } from '../models/TursoDB.js'

const port = process.env.PORT ?? 1234

const app = expres()
const server = new createServer(app)
const io = new Server (server)
const CheckComands = (msg)=>{
  const Comandos=['flor']
  if(msg.includes('/') && msg.includes('(') && msg.includes(')')){
  const Comando={
    Nombre:0,
    Variables:[]
  }
  let C = 0
  let i = 0

  C = msg.split('/')
  C.forEach(v=>{
    if(v.includes('(') && v.includes(')'))Comando.Nombre=v.slice(v[0],v.indexOf('('))
    if(Comandos.includes(Comando.Nombre))return
    i++
  })
  C=C[i].slice(C[i].indexOf('(')+1,C[i].indexOf(')'))
  C=C.split(',')
  i=0
  C.forEach(v => {
    if(v==='')Comando.Variables[i]=v
    else Comando.Variables[i]=parseInt(v)
    i++
  })
  //const Nmsg = msg.replace(`/${Comando.Nombre}(${Comando.Variables})`,'(Flor)')
  //quedo feo pero ahi ta por si quieres remplazar por algo nuevo
  const Nmsg = msg
  return({newMsg:Nmsg,Comando:Comando})
  }
}

io.on('connection', async (socket)=> {
  socket.on('User',async ({user})=>{
    await ChatModel.NewUser(user)
  })

  socket.on('chat message',async ({msg, user})=>{

    if(CheckComands(msg)){
      const {Comando,newMsg}=CheckComands(msg)
      const LastMsg = await ChatModel.ChatMessage({msg:newMsg, user})
      io.emit(Comando.Nombre,Comando.Variables)
      io.emit('chat message',{msg:newMsg, user, serverOffset:LastMsg})
      return
    }else{
      const LastMsg = await ChatModel.ChatMessage({msg, user})
      io.emit('chat message',{msg, user, serverOffset:LastMsg})
    }
  })

  if(!socket.recovered){
    const result = await ChatModel.RecoverMsg(socket.handshake.auth.serverOffset ?? 0)
      result.forEach(async row=>{
        socket.emit('chat message', 
        {msg:row.message,user:row.userName,serverOffset: row.message_Id}) 
    })
  }
  //  socket.on('disconnect', () => {
  //   console.log('Usuario desconectado')
  // });
})

app.get('/', (req, res)=>{
  res.sendFile(process.cwd() + '/client/')
})

server.listen(port, ()=>{
  console.log(`app listening on port http://localhost:${port}`)
})
