import { Component, OnInit } from '@angular/core';
import { CytoscapeService } from '../../cytoscape.service';
import { TimebarService } from '../../timebar.service';
import { GlobalVariableService } from '../../global-variable.service';
import { MIN_HIGHTLIGHT_WIDTH, MAX_HIGHTLIGHT_WIDTH } from '../../constants';
import stylesheet from '../../../assets/generated/stylesheet.json';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {
  settings: iBoolSetting[];
  highlightWidth: number;
  timebarPlayingStep: number;
  timebarPlayingSpeed: number;
  timebarZoomingStep: number;
  compoundPadding: string;
  timebarInclusionTypes: string[];

  constructor(private _cyService: CytoscapeService, private _timebarService: TimebarService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.settings = [
      {
        text: 'Perform layout on changes', isEnable: true, actuator: this, fn: 'autoIncrementalLayoutSettingFn'
      },
      {
        text: 'Highlight on hover', isEnable: false, actuator: this._cyService, fn: 'highlighterCheckBoxClicked'
      },
      {
        text: 'Show overview window', isEnable: true, actuator: this._cyService, fn: 'navigatorCheckBoxClicked'
      },
      {
        text: 'Show edge labels', isEnable: true, actuator: this._cyService, fn: 'showHideEdgeLabelCheckBoxClicked'
      },
      {
        text: 'Show timebar', isEnable: true, actuator: this._cyService, fn: 'showHideTimebar'
      },
      {
        text: 'Hide disconnected nodes on time filtering', isEnable: false, actuator: this._timebarService, fn: 'setisHideDisconnectedNodes'
      },
      {
        text: 'Ignore case in text operations', isEnable: false, actuator: this, fn: 'ignoreCaseSettingFn'
      },
    ];

    this.highlightWidth = 4.5;
    this.timebarPlayingStep = 50;
    this.timebarZoomingStep = 50;
    this.timebarPlayingSpeed = -1350;
    this.compoundPadding = '5%';
    this.timebarInclusionTypes = ['Contained by', 'Overlaps', 'Contains'];
  }

  onBoolSettingsChanged(setting: iBoolSetting) {
    setting.actuator[setting.fn](setting.isEnable);
  }

  ignoreCaseSettingFn(isEnable: boolean) { this._g.isIgnoreCaseInText = isEnable; }

  autoIncrementalLayoutSettingFn(isEnable: boolean) { this._g.isAutoIncrementalLayoutOnChange = isEnable; }

  changeHighlightOptions() {
    if (this.highlightWidth < MIN_HIGHTLIGHT_WIDTH) {
      this.highlightWidth = MIN_HIGHTLIGHT_WIDTH;
    }
    if (this.highlightWidth > MAX_HIGHTLIGHT_WIDTH) {
      this.highlightWidth = MAX_HIGHTLIGHT_WIDTH;
    }
    this._cyService.changeHighlightOptions(this.highlightWidth);
  }

  setTimebarPlayingSpeed() {
    this._timebarService.changeSpeed(this.timebarPlayingSpeed);
  }

  setTimebarZoomStep() {
    this._timebarService.changeZoomStep(this.timebarZoomingStep);
  }

  changeCompoundPadding() {
    stylesheet.find(x => x.selector == ':compound').style.padding = this.compoundPadding;
    this._g.setStyleFromJson(stylesheet);
  }

  inclusionTypeChanged(i: number) {
    this._timebarService.changeInclusionType(i);
    this._timebarService.renderChart();
    this._timebarService.rangeChange(false, true);
  }
}

interface iBoolSetting {
  isEnable: boolean;
  text: string;
  actuator: any;
  fn: string;
}