import mysql2 from 'mysql2/promise'

const config={
  host: '127.0.0.1',
  user: 'root',
  port: '3306',
  password: '1234',
  database: 'ChatDB'
}

const connection = await mysql2.createConnection(config)

export class ChatModel {
  static async NewUser(User) {
    const [UserV] = await connection.query('SELECT user_Id FROM users WHERE username = ?', User)
    if (UserV.length === 0) {
      await connection.query('INSERT INTO users (username) VALUES (?)', User)  
      return ('Regristro Exitoso')
    }
    else{
      return('Usuario ya registrado')
    }
  }
  static async ChatMessage({msg, user}){
    try{
      const result = await connection.query(
        'INSERT INTO messages (message, user_Id) VALUES (?,(SELECT user_Id FROM users WHERE username = ?))',
        [msg, user])
      return (result)
    }catch(e){
      return (e)
    }
  }
  static async RecoverMsg(message_Id){
    try{
    const [messages] = await connection.query(
      'SELECT * FROM messages WHERE message_Id>?',
      [message_Id ?? 0]
    )
    const result = await Promise.all(messages.map(async row => {
      const [userName] = await connection.query(
        'SELECT username FROM users WHERE user_Id=  ?',
        row.user_Id
      )
      row.userName = userName[0].username
      return row
    }))
    return result
    }catch(e){
      return e
    }
  }
}