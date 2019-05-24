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

const isTyping = (socket: any) => {
    socket.on('isTyping', (data) => {
        socket.broadcast.to(data.room).emit('userTyping', JSON.stringify({user: data.user, room: data.room}));
    });
};

const notTyping = (socket: any) => {
    socket.on('notTyping', (data) => {
        socket.broadcast.to(data.room).emit('userNotTyping', JSON.stringify({user: data.user, room: data.room}));
    });
};

const listUserOnl = (socket: any, users: any) => {
    socket.broadcast.emit('usersOnl', users);
};

const refreshListUserOnl = (socket: any, users: any) => {
    socket.broadcast.emit('reusersOnl', users);
};

const onLoadUserOnl = (socket: any, users: any) => {
    socket.emit('loadusersOnl', users);
};

export {
    joinRoomAfterSignin,
    onSendMessage,
    isTyping,
    notTyping,
    listUserOnl,
    refreshListUserOnl,
    onLoadUserOnl
};
