function dropBomb(socket, playerId, position) {
    socket.emit('dropBomb',
    {
        playerId: playerId,
        gridPosition: position
    });
}