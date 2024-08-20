class dbUsers {
  constructor(dao) {
    this.dao = dao;
    this.createTable();
  }

  createTable = async () => {
    let sql = `
        BEGIN;
        
        create table if not exists users(id serial primary key, username text, datejoined timestamp, img text, phoneno text, email text, fullname text, password text);
        
        create table if not exists comments(id serial primary key, discussionid int, username text, comment text, date timestamp, type text);

        COMMIT;`;
    this.dao.run(sql);
  };

  addUser(data) {
    data.profilepic = data.profilepic.replaceAll(":", "-");
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
}

module.exports = dbUsers;
