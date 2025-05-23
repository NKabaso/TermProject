/*

This code is intended to serve as the base code for building
an online multi-player game where clients are kept in synch
through a server -presumably using the socket.io npm module.


Use browser to view pages at http://localhost:3000/collisions.html
*/

//Server Code
const server = require('http').createServer(handler)
const io = require('socket.io')(server) // wrap server app in socket io capability
const fs = require("fs") //needed if you want to read and write files
const url = require("url") //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 300

const ROOT_DIR = "html" //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", //should really be application/javascript
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  //Get MIME type based on extension of requested file name
  //e.g. index.html --> text/html
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

server.listen(PORT)
/*
http.createServer(function(request, response) {
    let urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let receivedData = ""
    let dataObj = null
    let returnObj = null

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
      //Handle the client POST requests
      //console.log('received data: ', receivedData)

      //If it is a POST request then we will check the data.
      if (request.method == "POST") {
        //Do this for all POST messages
        //echo back the data to the client FOR NOW
        dataObj = JSON.parse(receivedData)
        console.log("received data object: ", dataObj)
        console.log("type: ", typeof dataObj)
        console.log("USER REQUEST: " + dataObj.text)
        returnObj = {}
        returnObj.text = dataObj.text
        response.writeHead(200, {
          "Content-Type": MIME_TYPES["json"]
        })
        response.end(JSON.stringify(returnObj))
      }
      else if (request.method == "GET") {
        //handle GET requests as static file requests
        var filePath = ROOT_DIR + urlObj.pathname
        if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html"

        fs.readFile(filePath, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(filePath)
          })
          response.end(data)
        })
      }
    })
  }).listen(3000)
*/
function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  //console.log('\n============================')
  //console.log("PATHNAME: " + urlObj.pathname)
  //console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  //console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function (err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}
//Socket Server
//Store userId and their socket IDs
const connectedUsers = new Map();
io.on('connection', function (socket) {
  console.log('A person has joined')
  //Checks if a home/ visitor client exists
  if(connectedUsers.has('home'))
    io.emit('server added', 'home')
  if(connectedUsers.has('visitor'))
    io.emit('server added', 'visitor')
    
  //Adds a user
  socket.on("join user", (userId) => {
    connectedUsers.set(userId, socket.id)
    io.emit('server added', userId)
    console.log(`User ${userId} joined witha socket ID ${socket.id}`);
  })

  socket.on('disconnect', function (data) {
    //event emitted when a client disconnects
    console.log('client disconnected')
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  })

  socket.on('clientSays', function(){
    for(const key of connectedUsers.keys()){
      let clientSocketId = connectedUsers.get(key)
      io.to(clientSocketId).emit('serverSays')
    }
  })
  //Broadcast the mouse click to other clients
  socket.on('mouseDown',function(stone, cue){
    
    for(const key of connectedUsers.keys()){
      let clientSocketId = connectedUsers.get(key)
      io.to(clientSocketId).emit('serverMouseDown', stone, cue)
    }
      
    //socket.broadcast.emit('serverMouseDown', stone, cue)
  })

  //Broadcasts the player's movement
  socket.on('mouseMove',function(x, y){
    
    for(const key of connectedUsers.keys()){
      let clientSocketId = connectedUsers.get(key)
      io.to(clientSocketId).emit('serverMouseMove', x , y)
    }
      
    //socket.broadcast.emit('serverMouseMove', x,y)
  })
  socket.on('mouseUp',function(){
    
    for(const key of connectedUsers.keys()){
      let clientSocketId = connectedUsers.get(key)
      io.to(clientSocketId).emit('serverMouseUp')
    }
      
    //socket.broadcast.emit('serverMouseUp')
  })

  
    
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log("To Test")
console.log(`http://localhost:${PORT}/curling.html`)
