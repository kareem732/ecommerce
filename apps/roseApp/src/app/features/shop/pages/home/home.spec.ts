import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';

@Component({ selector: 'app-best-selling', template: '' })
class BestSellingStub {}

describe('Home', () => {
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Home] })
      .overrideComponent(Home, { set: { imports: [BestSellingStub] } })
      .compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('renders the best selling section', () => {
    expect(fixture.nativeElement.querySelector('app-best-selling')).toBeTruthy();
  });
});
