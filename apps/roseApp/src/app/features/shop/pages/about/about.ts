import { Component } from '@angular/core';
import { ArrowRight, Check, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-about',
  imports: [LucideAngularModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  readonly check = Check
  readonly arrowRight = ArrowRight;
}
