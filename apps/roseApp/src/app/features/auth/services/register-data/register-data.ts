import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegisterData {
    registerData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    gender?: string;
    phone?: string;
    password?: string;
  } = {};
}
