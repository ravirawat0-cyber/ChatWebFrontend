import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;
  private messageSource = new BehaviorSubject<string>('');
  currentMessage = this.messageSource.asObservable();
  public notification = new BehaviorSubject<string | null>(null);

  constructor() {}

  public startConnection(username: string, chatRoom: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7060/chatHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection Started');
        this.hubConnection?.invoke('JoinSpecificChatRoom', {
          username,
          chatRoom,
        });
      })
      .catch((err) => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('ReceiveMessage', (user, message) => {
      this.messageSource.next(`${user}: ${message}`);
    });

    this.hubConnection.on('ReceiveSpecificMessage', (user, message) => {
      this.messageSource.next(`${user} : ${message}`);
    });

    this.hubConnection.on('ReceiveNotification', (notification) => {
      this.notification.next(notification);
    });
  }

  public sendMessage(message: string): void {
    this.hubConnection
      ?.invoke('SendMessage', message)
      .catch((err) => console.error(err));
  }
}
