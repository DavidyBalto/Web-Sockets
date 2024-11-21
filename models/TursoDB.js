import { createClient } from "@libsql/client"
import 'dotenv/config'

const turso =createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

await turso.execute(`
  CREATE TABLE IF NOT EXISTS messages(
    message_Id INTEGER PRIMARY KEY,
    user_Id INTEGER REFERENCES users(user_Id),
    message TEXT
  )
`)
await turso.execute(`
CREATE TABLE IF NOT EXISTS users(
	user_Id INTEGER PRIMARY KEY,
	username CHAR(25)
);
`)

export class ChatModel{
  static async NewUser(User) {
    const UserV = await turso.execute({
      sql:'SELECT user_Id FROM users WHERE username = ?',
      args: [User]
    })
    if (UserV.rows.length === 0) {
      await turso.execute({
        sql:'INSERT INTO users (username) VALUES (?)',
        args: [User]
      })
      return ('Regristro Exitoso')
    }
    else{
      return('Usuario ya registrado')
    }
  }
  static async ChatMessage({msg, user}){
    try{
      const result = await turso.execute({
        sql:'INSERT INTO messages (message, user_Id) VALUES (?,(SELECT user_Id FROM users WHERE username = ?))',
        args:[msg, user]})
      return (result.lastInsertRowid.toString())
    }catch(e){
      return (e)
    }
  }
  static async RecoverMsg(message_Id){
    try{
    const messages = await turso.execute({
      sql:'SELECT * FROM messages WHERE message_Id>?',
      args:[message_Id ?? 0]
    })
    const result = await Promise.all(messages.rows.map(async row => {
      const userName = await turso.execute({
       sql: 'SELECT username FROM users WHERE user_Id=  ?',
       args: [row.user_Id]
    })
      row.userName = userName.rows[0].username
      return row
    }))
    return result
    }catch(e){
      return e
    }
  }
}
