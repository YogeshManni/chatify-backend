class dbEvents {
  constructor(dao) {
    this.dao = dao;
    this.createTable();
  }

  createTable = async () => {
    let sql = `
    BEGIN;
    create table if not exists events(id serial primary key, fronttext text, img text, avtSrc text,  
            userName text, content text, likes int, views int, date timestamp);
     create table if not exists discussions(id serial primary key,isotime text, username text ,name text, avatar text,date text, content text,  
      likes int);

      create table if not exists comments(id serial primary key, discussionid int, username text, comment text, date timestamp, type text);
    
      COMMIT;`;
    this.dao.run(sql);
  };

  getEvents() {
    //return this.dao.run(`select * from events order by date desc`);
    return this.dao
      .run(`select ev.*,count(cm.discussionid) totalcomments from events ev 
    left  join comments cm on ev.id = cm.discussionid and cm.type like '%event%'  group by ev.id  order by date desc`);
  }
  addEvent(data) {
    let fronttext = data.frontText.replaceAll("'", "''");
    // fronttext = fronttext.replaceAll('"', '""');

    let content = data.content.replaceAll("'", "''");
    //  content = content.replaceAll('"', '""');
    const sql = `insert into events(fronttext, img, avtSrc,userName, content, likes, views, date) values(
                  '${fronttext}',
                  '${data.img}',
                  '${data.avtSrc}',
                  '${data.userName}',
                  '${content}',
                  '${0}',
                  '${0}',
                  CURRENT_TIMESTAMP)`;

    return this.dao.run(sql);
  }

  addDiscussion(data) {
    data.content = data.content.replaceAll("'", "''");
    const sql = `insert into discussions(username, name, avatar, date,content, likes) values(
      '${data.username}',
      '${data.name}',
      '${data.avatar}',
      '${data.Date}',
      '${data.content}',
      '${data.likes}') returning *`;
    return this.dao.run(sql);
  }
  getDiscussions() {
    return this.dao.run(`select * from discussions order by date desc`);
  }

  addComments(data) {
    data.comment = data.comment.replaceAll("'", "''");
    const sql = `insert into comments(discussionid, username, comment, date, type) values(
      '${data.discussionid}',
      '${data.username}', 
      '${data.comment}',
      '${data.date}',
      '${data.type}') returning *`;
    return this.dao.run(sql);
  }

  getComments(discId, type) {
    return this.dao.run(
      `select * from comments where discussionid=${discId} and type like '%${type}%' order by date desc`
    );
  }

  updateLikes(data) {
    return this.dao.run(
      `update discussions set likes=${data.likes} where id=${data.id}`
    );
  }

  updateEventLikes(data) {
    return this.dao.run(
      `update events set likes=${data.likes} where id=${data.id}`
    );
  }

  updateEventViews(data) {
    return this.dao.run(
      `update events set views=${data.views} where id=${data.id}`
    );
  }

  updateEvent(data) {
    let fronttext = data.frontText.replaceAll("'", "''");
    let content = data.content.replaceAll("'", "''");
    return this.dao.run(
      `update events set fronttext=$1, img=$2, content=$3, date=CURRENT_TIMESTAMP where id=$4`,
      [fronttext, data.img, content, data.id]
    );
  }
}

module.exports = dbEvents;
