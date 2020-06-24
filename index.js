// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'tests')));

// Chatroom
var memnum=0
var logs=[]
var members = []
var membersact={}
var queue=[]
var userid=[]
var lobbyid=0
function rcolor(){
  r=127+Math.round(127*Math.random())
  g=127+Math.round(127*Math.random())
  b=127+Math.round(127*Math.random())
  color="#"+r.toString(16)+g.toString(16)+b.toString(16);
  return color
}
io.on('connection', (socket) => {
  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    logit("OD: "+socket.username+" Do: Global Co: "+data+"<br>");
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
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

  // when the user disconnects.. perform this
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
        tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>"+socket.username+" se odpojil</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"</div>"
        logit(tolog)
        io.emit('players',membersact)
        memnum=memnum-1
      }
      catch(err){
        tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>"+socket.username+" se odpojil</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"</div>"
        logit(tolog)
        io.emit('players',membersact)
      }}
  });

  socket.on('game message', (data) => {
    // we tell the client to execute 'new message'
    logit("OD: "+socket.username+" Do: "+membersact[socket.username].room+" Co: "+data.message+"<br>");
    socket.broadcast.to(membersact[socket.username].room).emit('game chat', data);
  });
  socket.on('fire', (data) => {
    // we tell the client to execute 'new message'
    logit("tah OD: "+socket.username+" Do: "+membersact[socket.username].room+" Co: "+data+"<br>");
    socket.broadcast.to(membersact[socket.username].room).emit('cover', data);
  });
  socket.on('ready', (data) => {
    // we tell the client to execute 'new message'
    logit("tah OD: "+socket.username+" Do: "+membersact[socket.username].room+" Co: ready"+"<br>");
    socket.broadcast.to(membersact[socket.username].room).emit('prepared', data);
  });
  socket.on("leave",()=>{
    socket.leave(membersact[socket.username].room)
    membersact[socket.username].active=0
    membersact[socket.username].rival=""
    membersact[socket.username].room=""
    socket.emit("out room",)
    io.emit('players',membersact)
  })
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
  socket.on('sendinvite',data=>{
    tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>"+socket.username+" poslal invite pro "+data+"</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"</div>"
    logit(tolog)
    socket.broadcast.emit('recieveinvite',[socket.username,data])
  })
  socket.on('acceptinvite',data=>{
      user1=socket.username
      user2=data
      if(membersact[user1].room=="" && membersact[user2].room==""){
        socket.emit('in room',user2)
        socket.join(lobbyid)
        socket.to(membersact[user2].id).emit("jj",[lobbyid,user1])
        membersact[user1].active=true
        membersact[user1].rival=user2
        membersact[user1].room=lobbyid
        membersact[user2].active=true
        membersact[user2].rival=user1
        membersact[user2].room=lobbyid
        io.emit('players',membersact)
        lobbyid++
        queue=queue.filter(function (el) {
          return el != user1;});
        queue=queue.filter(function (el) {
          return el != user2;});
        }
  })
  socket.on('jj', (data) => {
      socket.join(data[0])
      socket.emit('in room',data[1])
  });
  socket.on('pingpongball',(data)=>{
    let d = new Date();
    let n = d.getTime();
    socket.emit('pingpongball',([data,n]))
  })
  function logit(mes){
    var d = new Date();
    mes=d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds()+"<br>"+mes
    io.to('log').emit("nlog",mes)
    console.log(mes)
    logs[logs.length]=mes
  }
  socket.on('jlog', (data)=>{
    socket.join("log")
    socket.emit("jlog",[logs,membersact])
  })
});