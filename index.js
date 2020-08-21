var express = require('express');
var app = express();
var path = require('path');
const { Socket } = require('net');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

memnum=0
members = []
membersact={}
lobbyid=0
queue=[]
logs=[]
roominf=[]
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
        username=socket.username
        members=members.filter(function (el) {
          return el != username;
        });
        queue=queue.filter(function (el) {
          return el != username;
        });
        console.log("disconect disconect multi multi try")
        if(membersact[username].rival=="team"){
          console.log("disconect multi multi")
          roominf[membersact[username].room].freeplayers=roominf[membersact[socket.username].room].freeplayers.filter(function (el) {
            return el != username;
          });
          roominf[membersact[username].room].player=roominf[membersact[socket.username].room].player.filter(function (el) {
            return el != username;
          });
          for(y in roominf[membersact[username].room].teams){
            roominf[membersact[username].room].teams[y]=roominf[membersact[socket.username].room].teams[y].filter(function (el) {
              return el != username;
            });
          }
          if(roominf[membersact[username].room].king=username && roominf[membersact[username].room].player.length!=0){
            roominf[membersact[username].room].king=roominf[membersact[username].room].player[0]
          }
          socket.broadcast.to(membersact[username].room).emit('update roomdata',roominf[membersact[username].room])
        }
        roominf[membersact[username].room].player=roominf[membersact[username].room].player.filter(function (el) {
          return el != username;
        });
        membersact[username].active=false
        membersact[username].rival=""
        membersact[username].room=""
        memnum=memnum-1
        tolog="<div style='background-color:"+rcolor()+";padding:1rem;margin:1rem;box-sizing: border-box;'><h2>"+socket.username+" se odpojil</h2>čekárna "+JSON.stringify(queue)+"<br>"+JSON.stringify(members)+"</div>"
     
      }
      catch(err){
        console.log(err)
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
          return el != user2;
        });
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
    data=membersact[data].room
    if(membersact[user1].room==""){
      roominf[data].player[roominf[data].player.length]=user1
      roominf[data].freeplayers[roominf[data].freeplayers.length]=user1
      roominf[data].playerup[user1]=[false,[0],[]]//ammo(gliderammo),upgrady(),
      socket.emit('in game room',roominf[data])
      socket.join(data)
      socket.broadcast.to(data).emit('update roomdata',roominf[data])
      membersact[user1].active=true
      membersact[user1].rival="team"
      membersact[user1].room=data
      io.emit('players',membersact)
      queue=queue.filter(function (el) {
        return el != user1;})
    }
  })
  socket.on('game',()=>{
    user1=socket.username
    roominf[lobbyid]={}
    roominf[lobbyid].player=[user1]
    roominf[lobbyid].freeplayers=[user1]
    roominf[lobbyid].teams=[[],[]]
    roominf[lobbyid].teamsi=0
    roominf[lobbyid].king=user1
    roominf[lobbyid].playerup={}
    roominf[lobbyid].playerup[user1]=[false,[0],[]]//ready,ammo(gliderammo),upgrady(),
    socket.emit('in game room',roominf[lobbyid])
    socket.join(lobbyid)
    membersact[user1].active=true
    membersact[user1].rival="team"
    membersact[user1].room=lobbyid
    io.emit('players',membersact)
    lobbyid++
    queue=queue.filter(function (el) {
      return el != user1;
    });
  })
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
  socket.on('sendstate', (data) => {
    socket.broadcast.to(membersact[socket.username].room).emit('sendstate',data)
  });
  socket.on('fire',(data)=>{
    if(membersact[socket.username].rival=="team"){
      roominf[membersact[socket.username].room].teamspi[roominf[membersact[socket.username].room].teamsai]++
      roominf[membersact[socket.username].room].teamsai++
      if(roominf[membersact[socket.username].room].teamsai>=roominf[membersact[socket.username].room].teams.length){
        roominf[membersact[socket.username].room].teamsai=0
      }
      if(roominf[membersact[socket.username].room].teamspi[roominf[membersact[socket.username].room].teamsai]>=roominf[membersact[socket.username].room].teams[roominf[membersact[socket.username].room].teamsai].length){
        roominf[membersact[socket.username].room].teamspi[roominf[membersact[socket.username].room].teamsai]=0
      }
    }else{
      roominf[membersact[socket.username].room].activeid++
      if(roominf[membersact[socket.username].room].activeid==roominf[membersact[socket.username].room].player.length){
        roominf[membersact[socket.username].room].activeid=0
      }
    }
    io.to(membersact[socket.username].room).emit("fire",[data,roominf[membersact[socket.username].room]])
  })
  socket.on('leave',()=>{
    console.log("leave disconect multi multi try")
    username=socket.username
    if(membersact[socket.username].rival=="team"){
      console.log("disconect multi multi")
      roominf[membersact[username].room].freeplayers=roominf[membersact[socket.username].room].freeplayers.filter(function (el) {
        return el != username;
      });
      roominf[membersact[username].room].player=roominf[membersact[socket.username].room].player.filter(function (el) {
        return el != username;
      });
      for(y in roominf[membersact[username].room].teams){
        roominf[membersact[username].room].teams[y]=roominf[membersact[socket.username].room].teams[y].filter(function (el) {
          return el != username;
        });
      }
      if(roominf[membersact[username].room].king=username && roominf[members[username].room].player.length!=0){
        roominf[membersact[username].room].king=roominf[membersact[username].room].player[0]
      }
      socket.broadcast.to(membersact[username].room).emit('update roomdata',roominf[membersact[username].room])
    }
    roominf[membersact[socket.username].room].player=roominf[membersact[socket.username].room].player.filter(function (el) {
      return el != socket.username;
    });
    socket.broadcast.to(membersact[socket.username].room).emit('update roomdata',roominf[membersact[socket.username].room])
    socket.leave(membersact[socket.username].room)
    membersact[socket.username].active=0
    membersact[socket.username].rival=""
    membersact[socket.username].room=""
    io.emit('players',membersact)
  })
  socket.on('update roomdata',(data)=>{
    team=data[1]
    data=data[0]
    roomdata=roominf[membersact[data].room]
    roomdata.freeplayers=roomdata.freeplayers.filter(function (el) {
      return el != data;
    });
    for(i in roomdata.teams){
      roomdata.teams[i]=roomdata.teams[i].filter(function (el) {
      return el != data;
    });}
    roomdata.teams[team][roomdata.teams[team].length]=data
    if(data!=socket.username){roomdata.playerup[data][0]=false}
    roominf[membersact[data].room]=roomdata
    socket.broadcast.to(membersact[data].room).emit('update roomdata',roominf[membersact[data].room])
    socket.emit('update roomdata',roominf[membersact[data].room])
  })
  socket.on('update roomup',(data)=>{
    name=data[0]
    data=data[1]
    roominf[membersact[name].room].playerup[name]=data
    socket.broadcast.to(membersact[name].room).emit('update roomdata',roominf[membersact[name].room])
    socket.emit('update roomdata',roominf[membersact[name].room])
  })
  socket.on('start game',()=>{
    roominf[membersact[socket.username].room].seed=Math.random()*9999999
    spt=[]
    temp=0
    for(i of roominf[membersact[socket.username].room].teams){
      for(y in i){
        if(temp==0){
          spt[spt.length]=[50+y*100,i[y]]
        }else{
          spt[spt.length]=[1550-y*100,i[y]]
        }
      }
      temp++
    }
    roominf[membersact[socket.username].room].sp=spt
    roominf[membersact[socket.username].room].teamspi=[0,0]
    if(roominf[membersact[socket.username].room].teamsi>=roominf[membersact[socket.username].room].teams.length){roominf[membersact[socket.username].room].teamsi=0}
    roominf[membersact[socket.username].room].teamsai=roominf[membersact[socket.username].room].teamsi
    roominf[membersact[socket.username].room].teamsi++
    io.to(membersact[socket.username].room).emit('start game',roominf[membersact[socket.username].room])
  })
})