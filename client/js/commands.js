function dropBomb(socket, playerId, position) {
    socket.emit('dropBomb',
    {
        playerId: playerId,
        gridPosition: position
    });
}

function changePosition(socket, playerId, position) {
    socket.emit('move',
    {
        playerId: playerId,
        x: position[0],
        y: position[1]
    });
}