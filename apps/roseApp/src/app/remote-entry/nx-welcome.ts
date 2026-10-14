import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nx-welcome',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="wrapper">
      <div class="container">
        <div id="welcome">
          <h1>
            <span> Hello there, </span>
            Welcome roseApp 👋
          </h1>
        </div>

        <div
          style="background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border-default); padding: 16px"
        >
          Semantic test
        </div>
        <div
          style="background: var(--color-primary); color: var(--text-on-primary); padding: 16px"
        >
          Primary test
        </div>


      </div>
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {

}
