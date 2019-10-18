import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { EV_MOUSE_ON, EV_MOUSE_OFF } from '../constants';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements OnInit {

  private highlighterFn: (ev: any) => void;
  @Input() results: any[];
  @Input() isLoadGraph: boolean;
  @Input() isMergeGraph: boolean;
  @Input() txtCol1: string;
  @Input() txtCol2: string;
  @Input() resultCnt: number;
  @Input() currPage: number;
  @Input() pageSize: number;
  @Output() onPageChanged = new EventEmitter<number>();
  @Output() onDataForQueryResult = new EventEmitter<number>();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.highlighterFn = this._cyService.highlightNeighbors();
  }

  private getDataForQueryResult(id: number) {
    this.onDataForQueryResult.emit(id);
  }

  private onMouseEnter(id: number) {
    this.highlighterFn({ target: this._g.cy.$('#n' + id), type: EV_MOUSE_ON });
  }

  private onMouseExit(id: number) {
    this.highlighterFn({ target: this._g.cy.$('#n' + id), type: EV_MOUSE_OFF });
  }

  private pageChanged(newPage: number) {
    this.onPageChanged.emit(newPage);
  }

}