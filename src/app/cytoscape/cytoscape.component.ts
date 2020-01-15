import { Component, OnInit, HostListener } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { ContextMenuService } from '../context-menu/context-menu.service';
import { MarqueeZoomService } from './marquee-zoom.service';
import { GlobalVariableService } from '../global-variable.service';
import { Timebar2Service } from '../timebar2.service';

@Component({
  selector: 'app-cytoscape',
  templateUrl: './cytoscape.component.html',
  styleUrls: ['./cytoscape.component.css']
})
export class CytoscapeComponent implements OnInit {

  constructor(private _g: GlobalVariableService, private _cyService: CytoscapeService, private _tb2: Timebar2Service, private _ctxMenuService: ContextMenuService, private _marqueeService: MarqueeZoomService) { }
  cyClass = false;
  isLoading = true;

  ngOnInit() {
    this._cyService.initCy(document.getElementById('cy'));
    // this._timebarService.init();
    this._tb2.init();
    this._ctxMenuService.bindContextMenuExtension();
    this._marqueeService.setChangeClassFn(this.setClassForCyDiv.bind(this));
  }

  setClassForCyDiv(b: boolean) {
    this.cyClass = b;
  }

  @HostListener('document:keydown.delete', ['$event'])
  deleteHotKeyFn(event: KeyboardEvent) {
    if (document.activeElement.tagName == 'INPUT') {
      return;
    }
    this._g.cy.remove(':selected');
  }

  @HostListener('document:keydown.control.a', ['$event'])
  selectAllHotKeyFn(event: KeyboardEvent) {
    if (document.activeElement.tagName == 'INPUT') {
      return;
    }
    event.preventDefault();
    if (event.ctrlKey) {
      this._g.cy.$().select();
    }
  }

}
