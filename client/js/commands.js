function dropBomb(socket, position) {
    socket.emit('dropBomb',
    {
        gridPosition: position
    });
}

function changePosition(socket, position) {
    socket.emit('move',
    {
        x: position[0],
        y: position[1]
    });
}

function playerStopped(socket) {
    socket.emit('playerStopped');
}