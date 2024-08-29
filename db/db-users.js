class dbUsers {
  constructor(dao) {
    this.dao = dao;
  }

  addUser(data) {
    //data.profilepic = data.profilepic.replaceAll(":", "-");
    const sql = `insert into users(username, datejoined, img, phoneno, email, fullname, password) values(
      $1,CURRENT_TIMESTAMP,$2,$3,$4,$5,$6
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

  addChatId(data) {
    return this.dao.run(
      `INSERT INTO chatusers (userid, chat_ids)
  VALUES ($1, ARRAY[$2]::integer[])
  ON CONFLICT (userid)
  DO UPDATE SET chat_ids = array_append(chatusers.chat_ids, $2::INTEGER)`,
      [data.userId, data.chatId]
    );
  }

  getChatUsers(data) {
    return this.dao.run(
      `select * from users where id = ANY (select unnest(chat_ids) from chatusers where userid=$1)`,
      [data.id]
    );
  }
}

module.exports = dbUsers;
