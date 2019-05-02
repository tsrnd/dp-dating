import { EventHandler } from './controllers/events';
import * as SocketIO from 'socket.io';

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

        io.on('connection', (socket: any) => {
            const eventHandler = new EventHandler(socket);
            eventHandler.sayHello();
        });
    }

    public getServer() {
        return this.server;
    }
}

export default Socket;
