import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit, AfterViewChecked {
  @ViewChild('closeBtn', { static: false }) closeBtnRef: ElementRef;
  @Input() msg: string;
  @Input() title: string;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.closeBtnRef.nativeElement.blur();
  }

}
