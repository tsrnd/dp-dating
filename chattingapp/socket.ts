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
        io.on('connection', SocketJWT.authorize(socketJWT))
        .on('authenticated', async (socket) => {
            const auth = await Helper.getAuth(socket.decoded_token.id, socket.decoded_token.client_id);
            socket.user = auth;
            // handle chat
            EventHandler.joinRoomAfterSignin(socket);
            EventHandler.onSendMessage(socket);
        });
    }

    public getServer() {
        return this.server;
    }
}

export default Socket;
