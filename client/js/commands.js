function dropBomb(socket, playerId, position) {
    socket.emit('dropBomb',
    {
        playerId: playerId,
        gridPosition: position
    });
}

function move(socket, position) {
    socket.emit('move',
    {
        x: position[0],
        y: position[1]
    })
}