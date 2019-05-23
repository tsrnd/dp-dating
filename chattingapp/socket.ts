import * as EventHandler from './controllers/events';
import * as Helper from './controllers/Helper';
import * as SocketIO from 'socket.io';
import * as SocketJWT from 'socketio-jwt';
import * as config from 'config';


class Socket {
    private server: any;
    private io: any;

    constructor(server: any) {
        this.server = server;
        this.io = SocketIO(this.server);
        this.config();
    }

    private config() {
        const io = this.io;
        const socketJWT: any = {
            secret: config.get('chat_app.jwt.secret_key'),
            required: false
        };
        const users = [];
        io.on('connection', SocketJWT.authorize(socketJWT))
            .on('authenticated', async (socket) => {
                const auth = await Helper.getAuth(socket.decoded_token.id, socket.decoded_token.client_id);
                socket.user = auth;
                if (users.indexOf(auth.id) < 0) {
                    users.push(auth.id);
                }
                console.log(users);
                // handle chat
                EventHandler.joinRoomAfterSignin(socket);
                EventHandler.onSendMessage(socket);
                EventHandler.isTyping(socket);
                EventHandler.notTyping(socket);
                EventHandler.notTyping(socket);
                EventHandler.onLoadUserOnl(socket, users);
                EventHandler.listUserOnl(socket, users);
                socket.on('disconnect', () => {
                    users.splice(users.indexOf(auth.id), 1);
                    EventHandler.refreshListUserOnl(socket, users);
                });
            });
    }

    public getServer() {
        return this.server;
    }
}

export default Socket;
