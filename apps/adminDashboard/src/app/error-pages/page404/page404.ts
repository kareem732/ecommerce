import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-page404',
  imports: [TranslatePipe ],
  templateUrl: './page404.html',
  styleUrl: './page404.scss',
})
export class Page404 {}
