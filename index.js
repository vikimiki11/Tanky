var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

var memnum=0
var members = []
var membersact={}
var lobbyid=0
var queue=[]
var logs=[]
var roominf=[]
function rcolor(){
  r=127+Math.round(127*Math.random())
  g=127+Math.round(127*Math.random())
  b=127+Math.round(127*Math.random())
  color="#"+r.toString(16)+g.toString(16)+b.toString(16);
  return color
}
function logit(mes){
  var d = new Date();
  mes=d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds()+"<br>"+mes
  io.to('log').emit("nlog",mes)
  console.log(mes)
  logs[logs.length]=mes
}
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
      tolog=JSON.stringify(members)+"</div>"
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
        tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>"+socket.username+" se odpojil</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"</div>"
     
      }
      catch(err){
        tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>Velkej Debil co není schopen se lognout se odpojil</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"<br>"+err+"</div>"
      }}
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
        roominf[lobbyid]={}
        roominf[lobbyid].seed=Math.random()*9999999
        roominf[lobbyid].player=[user2,user1]
        roominf[lobbyid].activeid=0
        roominf[lobbyid].sp=[[200,user2],[1400,user1]]
        socket.emit('in room',[user2,roominf[lobbyid],true])
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
          return el != queue[0];
        });
      }
    }
    console.log("čekárna"+queue);
  });
  socket.on('jj', (data) => {
    socket.join(data[0])
    socket.emit('in room',[data[1],roominf[data[0]],true])
  });
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    logit("OD: "+socket.username+" Do: "+data[1]+" Co: "+data[0]+"<br>");
    if(data[1]=="g"){
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data[0],
      skupina: data[1]
    },true);}else{
      socket.broadcast.to(data[1]).emit('new message', {
        username: socket.username,
        message: data[0],
        skupina: data[1]
      },true);
    }
  });
  socket.on('acceptinvite',data=>{
    user1=socket.username
    user2=data
    if(membersact[user1].room=="" && membersact[user2].room==""){
      socket.join(lobbyid)
      socket.emit('in room',user2)
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
  socket.on('sendstate', (data) => {
    socket.broadcast.to(membersact[socket.username].room).emit('sendstate',data)
  });
  socket.on('fire',(data)=>{
    roominf[membersact[socket.username].room].activeid++
    //roominf[lobbyid].player
    if(roominf[membersact[socket.username].room].activeid==roominf[membersact[socket.username].room].player.length){
      roominf[membersact[socket.username].room].activeid=0
    }
    io.to(membersact[socket.username].room).emit("fire",[data,roominf[membersact[socket.username].room]])
  })
  socket.on('leave',()=>{
    socket.leave(membersact[socket.username].room)
    membersact[socket.username].active=0
    membersact[socket.username].rival=""
    roominf[membersact[socket.username].room].player=roominf[membersact[socket.username].room].player.filter(function (el) {
      return el != roominf[membersact[socket.username].room].player[0];
    });
    membersact[socket.username].room==""
    io.emit('players',membersact)
  })
})