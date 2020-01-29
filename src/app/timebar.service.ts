import { Injectable } from '@angular/core';
import * as $ from 'jquery';

import { GlobalVariableService } from './global-variable.service';
import AppDescription from '../assets/app_description.json';
import { TimebarMetric } from './operation-tabs/map-tab/filtering-types';
import { Timebar } from '../lib/timebar/Timebar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimebarService {

  shownMetrics = new BehaviorSubject<TimebarMetric[]>(null);
  isRandomizedLayout : boolean = false;
  private timebarExt: Timebar;

  constructor(private _g: GlobalVariableService) { }

  // this function should show only the provided elements, then should make layout
  private shownOnlyElems(elems, isRandomize: boolean) {
    let alreadyVisible = this._g.cy.nodes(':visible');
    if (alreadyVisible.length > 0) {
      let shownNodes = elems.nodes().difference(alreadyVisible);
      this._g.layoutUtils.placeNewNodes(shownNodes);
    }
    this._g.viewUtils.show(elems);
    this._g.viewUtils.hide(this._g.cy.elements().difference(elems));
    if (this.isRandomizedLayout) {
      this._g.performLayout(true);
      this.isRandomizedLayout = false;
    } else {
      this._g.performLayout(false);
    }
  }

  init() {
    const m = AppDescription.timebarDataMapping; // mapping for timebar
    const s = AppDescription.appPreferences.timebar; // settings for timebar
    const e = { // events (functions to be called in extension)
      maintainFiltering: (elems) => {
        return this._g.filterByClass(elems);
      },
      showOnlyElems: this.shownOnlyElems.bind(this),
      chartRendered: () => {
        $('#timebar').removeClass('d-none');
      },
    };
    s['events'] = e;
    const htmlElems = { chartElemId: 'chart_div', controllerElemId: 'filter_div' };
    this.timebarExt = this._g.cy.timebar(m, htmlElems, s);
    this.shownMetrics.subscribe(x => { this.timebarExt.setStats(x) });
  }

  coverVisibleRange() {
    this.timebarExt.coverVisibleRange();
  }

  coverAllTimes() {
    this.timebarExt.coverAllTimes();
  }

  changeZoom(isIncrease: boolean) {
    this.timebarExt.changeZoom(isIncrease);
  }

  moveCursor(isLeft: boolean) {
    this.timebarExt.moveCursor(isLeft);
  }

  setChartRange(s: number, e: number) {
    this.timebarExt.setGraphRange(s, e);
  }

  getChartRange(): number[] {
    return this.timebarExt.getGraphRange();
  }

  // ----------------------------------------- start of timebar settings  -----------------------------------------
  showHideTimebar(isActive: boolean) {
    this.timebarExt.setSetting('isEnabled', isActive);
  }

  setisHideDisconnectedNodes(val: boolean) {
    this.timebarExt.setSetting('isHideDisconnectedNodesOnAnim', val);
  }

  changePeriod(v: number) {
    this.timebarExt.setSetting('playingPeriod', v);
  }

  changeStep(v: number) {
    this.timebarExt.setSetting('playingStep', v);
  }

  changeZoomStep(v: number) {
    this.timebarExt.setSetting('zoomingStep', v);
  }

  changeGraphInclusionType(i: number) {
    this.timebarExt.setSetting('graphInclusionType', i);
  }

  changeStatsInclusionType(i: number) {
    this.timebarExt.setSetting('statsInclusionType', i);
  }

  setIsMaintainGraphRange(v: boolean) {
    this.timebarExt.setSetting('isMaintainGraphRange', v);
  }
  // ----------------------------------------- end of timebar settings  -----------------------------------------


  onStatsChanged(f) {
    this.timebarExt.setEventListener('statsRangeChanged', f);
  }

  onGraphChanged(f) {
    this.timebarExt.setEventListener('graphRangeChanged', f);
  }

  playTiming(callback: (isShowPlay: boolean) => void) {
    this.timebarExt.playTiming(callback);
  }

  getCurrTimeUnit(): number {
    return this.timebarExt.getCurrTimeUnit();
  }

  getGraphRangeRatio(): number {
    return this.timebarExt.getGraphRangeRatio();
  }
}


