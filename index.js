var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

var memnum=0
var members = []
var membersact={}
var lobbyid=0
io.on('connection', (socket) => {
  socket.on('add user', (username) => {
    if(members.indexOf(username)==-1){
      memnum++
      members[members.length]=username
      tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>připojil se: "+username+"</h2>"
      membersact[username]={}
      membersact[username].active=0
      membersact[username].rival=""
      membersact[username].room=""
      membersact[username].id=socket.id
      io.emit('players',membersact)

      // we store the username in the socket session for this client
      socket.username = username;
      tolog=tolog+JSON.stringify(members)+"</div>"
      logit(tolog)
      socket.emit('login', {
        numUsers: memnum
      });
    }else{socket.emit('denied',(true))}
  });
  socket.on('disconnect', () => {
    tolog=""
    if(socket.username){
      try{
        let username=socket.username
        membersact[username].active=false
        membersact[username].rival=""
        membersact[username].room=""
        members=members.filter(function (el) {
          return el != socket.username;
        });
        queue=queue.filter(function (el) {
          return el != socket.username;
        });
        memnum=memnum-1
      }
      catch(err){
        tolog=""
      }}
      tolog+="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>"+socket.username+" se odpojil</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"</div>"
      logit(tolog)
      io.emit('players',membersact)
  });
  socket.on('quickgame', () => {
    if(queue.length==0){
      socket.emit('in queue')
      queue[queue.length]=socket.username
    }else{
      user1=socket.username
      user2=queue[0]
      if(membersact[user1].room=="" && membersact[user2].room==""){
        socket.emit('in room',user2)
        socket.join(lobbyid)
        socket.to(membersact[queue[0]].id).emit("jj",[lobbyid,user1])
        membersact[user1].active=true
        membersact[user1].rival=user2
        membersact[user1].room=lobbyid
        membersact[user2].active=true
        membersact[user2].rival=user1
        membersact[user2].room=lobbyid
        io.emit('players',membersact)
        lobbyid++
        queue=queue.filter(function (el) {
          return el != queue[0];});
      }
    }
    console.log("čekárna"+queue);
  });
  socket.on('jj', (data) => {
    socket.join(data[0])
    socket.emit('in room',data[1])
  });
})