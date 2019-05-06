export class EventHandler {
    private socket: any;
    constructor(socket: any) {
        this.socket = socket;
    }
    sayHello = () => {
        this.socket.emit('greeting', 'Hola');
    };
}
