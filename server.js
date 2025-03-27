/*
(c) 2025 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in the package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
//or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

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
// // Store user IDs and their socket IDs
const connectedUsers = new Map();
io.on('connection', function (socket) {
  console.log('client connected')

  //Credits: Deepseek
  // Example: Associate a user ID with their socket.id
  socket.on("register user", (userId) => {
    // connectedUsers[userId] = socket.id;
    connectedUsers.set(userId, socket.id)
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  //Credits: Deepseek
  // Example: Send a message to a specific user by their user ID
  socket.on("send to user", ({ userId, message }) => {
    //const targetSocketId = connectedUsers[userId];
    const targetSocketId = connectedUsers.get(userId)
    if (targetSocketId) {
      io.to(targetSocketId).emit("private message", message);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  });

  socket.on('clientSays', function (senderId, data) {
    console.log('RECEIVED: ' + data)
    //Sends to everyone but the client    
    for(const key of connectedUsers.keys()){
      if(senderId !== key){
        let clientSocketId = connectedUsers.get(key)
        io.to(clientSocketId).emit('serverSays', data)
      }
    }
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
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
