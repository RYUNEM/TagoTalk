import TcpSocket from 'react-native-tcp-socket';

export default class HostServer {
  constructor(port = 8080) {
    this.port = port;
    this.clients = [];
    this.server = null;
  }

  start() {
    this.server = TcpSocket.createServer((socket) => {
      console.log('New client connected:', socket.address());

      // Add client to list
      this.clients.push(socket);

      socket.on('data', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.broadcast(msg, socket); // broadcast to other clients
        } catch (e) {
          console.warn('Invalid data:', e);
        }
      });

      socket.on('error', (err) => {
        console.log('Socket error:', err);
      });

      socket.on('close', () => {
        this.clients = this.clients.filter((c) => c !== socket);
        console.log('Client disconnected');
      });
    });

    this.server.listen({ port: this.port, host: '0.0.0.0' }, () => {
      console.log(`Server running at 0.0.0.0:${this.port}`);
    });

    this.server.on('error', (err) => {
      console.log('Server error:', err);
    });
  }

  broadcast(msg, sender) {
    const data = JSON.stringify(msg);
    this.clients.forEach((client) => {
      if (client !== sender) {
        client.write(data);
      }
    });
  }

  stop() {
    this.clients.forEach((c) => c.destroy());
    this.server?.close();
  }
}
