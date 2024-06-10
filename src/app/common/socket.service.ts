import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket = new Socket({
    url: environment.baseUrl.socket,
    options: { withCredentials: true, path: `${environment.url.socket}/socket.io` }
  })

  constructor() { }

  connect() {
    this.socket.connect()
  }

  receive(channel: string) {
    return this.socket.fromEvent(channel)
  }

  disconnect() {
    this.socket.disconnect()
  }
}
