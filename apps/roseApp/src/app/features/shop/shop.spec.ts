import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet, provideRouter } from '@angular/router';
import { Shop } from './shop';

@Component({ selector: 'app-navbar', template: '' })
class NavbarStub {}

@Component({ selector: 'app-footer', template: '' })
class FooterStub {}

describe('Shop', () => {
  let fixture: ComponentFixture<Shop>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [provideRouter([])],
    })
      .overrideComponent(Shop, {
        set: { imports: [RouterOutlet, NavbarStub, FooterStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Shop);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders the navbar, the content area and the footer in order', () => {
    const tags = Array.from(element.children).map((child) => child.tagName.toLowerCase());

    expect(tags).toEqual(['app-navbar', 'main', 'app-footer']);
  });

  it('renders the router outlet inside the main area', () => {
    expect(element.querySelector('main router-outlet')).toBeTruthy();
  });
});
