import { Component } from '@angular/core';
import { SignalrService } from '../signalr.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  username = '';
  chatRoom = '';
  message = '';
  messages: string[] = [];
  notifications: string[] = [];
  isJoined = false;

  private notificationSound = new Audio('../../assets/notif.mp3');

  constructor(
    private signalRService: SignalrService,
    private snackBar: MatSnackBar
  ) {
    this.signalRService.currentMessage.subscribe((msg) => {
      if (msg) {
        this.messages.push(msg);
        this.playNotificationSound();
      }
    });

    this.signalRService.notification.subscribe((notification) => {
      if (notification) {
        this.notifications.push(notification);
        this.showNotification(notification);
      }
    });
  }

  joinChat() {
    if (this.username && this.chatRoom) {
      this.signalRService.startConnection(this.username, this.chatRoom);
      this.isJoined = true;
    }
  }

  sendMessage() {
    if (this.message) {
      this.signalRService.sendMessage(this.message);
      this.message = '';
    }
  }

  private showNotification(notification: string) {
    this.snackBar.open(notification, 'Close', { duration: 120000 });
  }

  private playNotificationSound() {
    this.notificationSound.play().catch((error) => {
      console.error('Error playing soung:', error);
    });
  }
}
