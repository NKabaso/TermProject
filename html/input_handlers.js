//KEY CODES
//should clean up these hard coded key codes
const ENTER = 13
const RIGHT_ARROW = 39
const LEFT_ARROW = 37
const UP_ARROW = 38
const DOWN_ARROW = 40

function handleKeyDown(e) {
    //console.log("keydown code = " + e.which );
    let keyCode = e.which
    if (keyCode == UP_ARROW | keyCode == DOWN_ARROW) {
        //prevent browser from using these with text input drop downs
        e.stopPropagation()
        e.preventDefault()
    }
}

function handleKeyUp(e) {
    //console.log("key UP: " + e.which);
    if (e.which == RIGHT_ARROW | e.which == LEFT_ARROW | e.which == UP_ARROW | e.which == DOWN_ARROW) {
        //do nothing for now
    }

    if (e.which == ENTER) {
        handleSubmitButton() //treat ENTER key like you would a submit
        $('#userTextField').val('') //clear the user text field
    }

    e.stopPropagation()
    e.preventDefault()
}

function getCanvasMouseLocation(e) {
    //provide the mouse location relative to the upper left corner
    //of the canvas

    /*
    This code took some trial and error. If someone wants to write a
    nice tutorial on how mouse-locations work that would be great.
    */
    let rect = canvas.getBoundingClientRect()

    //account for amount the document scroll bars might be scrolled

    //get the scroll offset
    const element = document.getElementsByTagName("html")[0]
    let scrollOffsetX = element.scrollLeft
    let scrollOffsetY = element.scrollTop

    let canX = e.pageX - rect.left - scrollOffsetX
    let canY = e.pageY - rect.top - scrollOffsetY

    return {
        x: canX,
        y: canY
    }
}

function handleMouseDown(e) {
    if (enableShooting === false) return //cannot shoot when stones are in motion
    if (!isClientFor(whosTurnIsIt)) return //only allow controlling client
    //socket.emit('mouseDown', e)
    
    let canvasMouseLoc = getCanvasMouseLocation(e)
    let canvasX = canvasMouseLoc.x
    let canvasY = canvasMouseLoc.y
    //console.log("mouse down:" + canvasX + ", " + canvasY)
    socket.emit('mouseDown', canvasX, canvasY, canvasMouseLoc)
    stoneBeingShot = allStones.stoneAtLocation(canvasX, canvasY)
    if (stoneBeingShot === null) {
        if (iceSurface.isInShootingCrosshairArea(canvasMouseLoc)) {
            if (shootingQueue.isEmpty()){
                console.log("FInsihed")
                stageStones()
            } 
            //console.log(`shooting from crosshair`)
            stoneBeingShot = shootingQueue.front()
            stoneBeingShot.setLocation(canvasMouseLoc)
            //we clicked near the shooting crosshair
        }
    }

    if (stoneBeingShot != null) {
        shootingCue = new Cue(canvasX, canvasY)
        console.log("Move:"+JSON.stringify(stoneBeingShot, null, 2));
        //socket.emit('mouseDown', stoneBeingShot, shootingCue)
        document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
        document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)
    }

    // Stop propagation of the event and stop any default
    //  browser action
    e.stopPropagation()
    e.preventDefault()

    drawCanvas()
    
}

function handleMouseMove(e) {
    
    let canvasMouseLoc = getCanvasMouseLocation(e)
    let canvasX = canvasMouseLoc.x
    let canvasY = canvasMouseLoc.y

   // console.log("mouse move: " + canvasX + "," + canvasY)

    if (shootingCue != null) {
        //console.log("Move:"+JSON.stringify(shootingCue, null, 2));
        shootingCue.setCueEnd(canvasX, canvasY)
        socket.emit('mouseMove', canvasX, canvasY)
    }

    e.stopPropagation()

    drawCanvas()  
}

function handleMouseUp(e) {
    //console.log("Up:"+ JSON.stringify(shootingCue, null, 2));
    //console.log("Queue:"+JSON.stringify(shootingQueue, null, 2)); 

    e.stopPropagation()
    socket.emit('mouseUp')
    
    if (shootingCue != null) {
        let cueVelocity = shootingCue.getVelocity()
        if (stoneBeingShot != null) {
            stoneBeingShot.addVelocity(cueVelocity)
        }
        shootingCue = null
        shootingQueue.dequeue()
       // console.log("Queue:"+JSON.stringify(shootingQueue, null, 2));
        enableShooting = false //disable shooting until shot stone stops
    }
        

    //remove mouse move and mouse up handlers but leave mouse down handler
    document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp)

    drawCanvas() //redraw the canvas
    
}
