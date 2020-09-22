import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { TimebarComponent } from './timebar.component';

describe('TimebarComponent', () => {
  let component: TimebarComponent;
  let fixture: ComponentFixture<TimebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimebarComponent],
      imports: [HttpClientModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});