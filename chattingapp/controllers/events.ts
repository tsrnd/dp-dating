import * as Helper from '../controllers/Helper';

const joinRoomAfterSignin = async (socket: any) => {
    const rooms = await Helper.getRoomsOfUserById(socket.user.id);
    rooms.forEach(room => {
        socket.join(room._id);
    });
};

const onSendMessage = (socket: any) => {
    socket.on('clientSendMessage', async data => {
        const saved = await Helper.saveMessage({
            message: data,
            user: socket.user
        });
        socket.broadcast.to(data.roomID).emit('loadMessage', JSON.stringify({message: data, user: socket.user.id}));
    });
};

export {
    joinRoomAfterSignin,
    onSendMessage,
};
