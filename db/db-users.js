class dbUsers {
  constructor(dao) {
    this.dao = dao;
  }

  addUser(data) {
    //data.profilepic = data.profilepic.replaceAll(":", "-");
    const sql = `insert into users(username, datejoined, img, phoneno, email, fullname, password, lastseen) values(
      $1,CURRENT_TIMESTAMP,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP
    )`;
    return this.dao.run(sql, [
      data.username,
      data.profilepic,
      data.phone,
      data.email,
      data.fullname,
      data.password,
    ]);
  }

  getUsers() {
    return this.dao.run(`select * from users`);
  }

  getUser(data) {
    return this.dao.run(`select * from users where username=$1`, [
      data.username,
    ]);
  }

  updateUser(userdata) {
    const data = userdata.data.user;
    userdata.filename = userdata.filename.replaceAll(":", "-");
    return this.dao.run(
      `update users set img=$1,phoneno=$2, fullname=$3 where username = $4 returning *`,
      [userdata.filename, data.phoneno, data.fullname, data.username]
    );
  }

  searchUser(user) {
    return this.dao.run(`select * from users where username ILIKE $1`, [
      `${user}%`,
    ]);
  }

  async addChatId(data) {
    await this.dao.run(
      `
      INSERT INTO chatusers (userid, chat_ids)
  VALUES ($1, ARRAY[$2]::integer[])
  ON CONFLICT (userid)
  DO UPDATE SET chat_ids = array_append(chatusers.chat_ids, $2::INTEGER)

  `,
      [data.userId, data.chatId]
    );

    await this.dao.run(
      `
      INSERT INTO chatusers (userid, chat_ids)
    VALUES ($2, ARRAY[$1]::integer[])
    ON CONFLICT (userid)
    DO UPDATE SET chat_ids = array_append(chatusers.chat_ids, $1::INTEGER);
   
  `,
      [data.userId, data.chatId]
    );
  }

  getChatUsers(data) {
    return this.dao.run(
      `
  WITH user_chats AS (
      SELECT unnest(chat_ids) AS chat_id
      FROM chatusers
      WHERE userid = $1
  ),
  user_data AS (
      SELECT u.*
      FROM users u
      WHERE u.id = ANY (SELECT chat_id FROM user_chats)
  )
  
  select content[array_length(content,1)],user_data.* from  user_data inner join  messages on (messages.sender_id  = user_data.id  or   messages.receiver_id  = user_data.id)  where (sender_id = $1 or receiver_id = $1)

`,
      [data.id]
    );
  }

  saveMessage(data) {
    // Check if a relevant message exists
    if (!data.firstTime) {
      // Append to existing JSONB content
      return this.dao.run(
        `UPDATE messages
     SET content = array_append(content, $3::jsonb)
     WHERE (sender_id = $1 AND receiver_id = $2)
   OR (sender_id = $2 AND receiver_id = $1)`,
        [data.sender, data.receiver, JSON.stringify(data.msg)]
      );
    } else {
      // Insert a new message
      return this.dao.run(
        `INSERT INTO messages (sender_id, receiver_id, content)
     VALUES ($1, $2, ARRAY[$3::jsonb])`,
        [data.sender, data.receiver, JSON.stringify(data.msg)]
      );
    }
  }

  getMessages(data) {
    return this.dao.run(
      `select content from messages where (sender_id = $1 AND receiver_id = $2)
   OR (sender_id = $2 AND receiver_id = $1)`,
      [data.sender, data.receiver]
    );
  }

  updateMessage(data) {
    // update precious message
    return this.dao.run(
      `
UPDATE messages
SET content[array_length(content,1)] = jsonb_set(content[array_length(content,1)],'{isRead}','true')
WHERE (sender_id = $1 AND receiver_id = $2)
   OR (sender_id = $2 AND receiver_id = $1)`,
      [data.sender, data.receiver]
    );
  }

  updatelastSeen(data) {
    // update lastSeen datetime

    return this.dao.run(
      `
        update users set lastseen = CURRENT_TIMESTAMP where  id = $1
      `,
      [data.userId]
    );
  }
}
module.exports = dbUsers;
