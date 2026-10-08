import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, ImageModule],
  templateUrl: './auth.html',
})
export class Auth {}
