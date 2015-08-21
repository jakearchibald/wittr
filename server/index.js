import Server from './Server';
import Settings from './Settings';

const server = new Server();
const settings = new Settings();

server.listen(8888);
settings.listen(8889);
