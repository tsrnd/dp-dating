import app from './app';
import * as util from 'util';
import { Server } from 'http';

const port = process.env.PORT || 3000;
const server = new Server(app);

server.listen(port, () => {
    console.log(util.format('Server is running on port %d', port));
});
