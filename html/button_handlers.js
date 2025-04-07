
function handleJoinAsHomeButton(){
  console.log(`handleJoinAsHomeButton()`)
  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  if(!isHomePlayerAssigned){
    socket.emit('join user', 'home')
    isHomePlayerAssigned = true
    isHomeClient = true
    
  }

}
function handleJoinAsVisitorButton(){
  console.log(`handleJoinAsVisitorButton()`)
  let btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isVisitorPlayerAssigned) {
    isVisitorPlayerAssigned = true
    isVisitorClient = true
    socket.emit('join user', 'visitor')
  }
}
function handleJoinAsSpectatorButton(){
  console.log(`handleJoinAsSpectatorButton()`)
  let btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isSpectatorClient){
    isSpectatorClient = true
    socket.emit('join user', 'spectator')
  } 

}
