import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent {

  phone = '';
  otp = '';
  message = '';

  // ⏱ TIMER ADDED
  timer: number = 0;
  interval: any;
  canResend: boolean = false;

  constructor(private http: HttpClient) {}

  // 📩 SEND OTP
  sendOTP() {
    this.http.post('http://localhost:5000/api/auth/send-otp', {
      phone: this.phone
    }).subscribe({
      next: (res: any) => {

        this.message = res.message;

        // ⏱ use backend expiry (120 sec)
        this.timer = res.expiresIn || 120;

        this.canResend = false;

        this.startTimer();
      },
      error: () => this.message = 'Error sending OTP'
    });
  }

  // ⏱ TIMER LOGIC
  startTimer() {
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;

      if (this.timer <= 0) {
        clearInterval(this.interval);
        this.canResend = true;
      }
    }, 1000);
  }

  // 🔐 VERIFY OTP
  verifyOTP() {
//     https://xxxxx.execute-api.ap-south-1.amazonaws.com/dev/send-otp
// https://xxxxx.execute-api.ap-south-1.amazonaws.com/dev/verify-otp
    this.http.post('http://localhost:5000/api/auth/verify-otp', {
      phone: this.phone,
      otp: this.otp
    }).subscribe({
      next: (res: any) => {

        this.message = res.message;

        // ❌ removed wrong OTP display logic (was unnecessary)

        // 🔐 store JWT token
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      },
      error: () => this.message = 'Invalid OTP'
    });
  }

}