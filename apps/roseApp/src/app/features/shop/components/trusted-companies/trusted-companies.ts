import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-trusted-companies',
  imports: [TranslatePipe],
  templateUrl: './trusted-companies.html',
  styleUrl: './trusted-companies.scss',
})
export class TrustedCompanies {
  logos = [
    { name: 'Coconut', src: 'company1.png' },
    { name: 'Ginyard', src: 'company2.png' },
    { name: 'Ingoude', src: 'company3.png' },
    { name: 'Velvet', src: 'company4.png' },
    { name: 'Ingoude', src: 'company5.png' },
    { name: 'Habus', src: 'company6.png' },
  ];
}
