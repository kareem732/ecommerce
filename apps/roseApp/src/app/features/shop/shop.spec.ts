import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet, provideRouter } from '@angular/router';
import { Shop } from './shop';

@Component({ selector: 'app-toast-host', template: '' })
class ToastHostStub {}

describe('Shop', () => {
  let fixture: ComponentFixture<Shop>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [provideRouter([])],
    })
      .overrideComponent(Shop, {
        set: { imports: [RouterOutlet, ToastHostStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Shop);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders the router outlet and the toast host in order', () => {
    const tags = Array.from(element.children).map((child) => child.tagName.toLowerCase());

    expect(tags).toEqual(['router-outlet', 'app-toast-host']);
  });

  it('renders the router outlet for the child pages', () => {
    expect(element.querySelector('router-outlet')).toBeTruthy();
  });
});
