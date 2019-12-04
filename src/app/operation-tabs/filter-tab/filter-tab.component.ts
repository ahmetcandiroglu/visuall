import { Component, OnInit } from '@angular/core';
import properties from '../../../assets/generated/properties.json';
import { compareUsingOperator, FILTER_CLASS_HIDE, GENERIC_TYPE } from '../../constants';
import * as $ from 'jquery';
import { DbService } from '../../db.service';
import { CytoscapeService } from '../../cytoscape.service';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarService } from '../../timebar.service';
import flatpickr from 'flatpickr';
import { iClassOption, iClassBasedRules, iRule, iRuleSync } from './filtering-types.js';
import { Subject } from 'rxjs';
import ModelDescription from '../../../model_description.json';

@Component({
  selector: 'app-filter-tab',
  templateUrl: './filter-tab.component.html',
  styleUrls: ['./filter-tab.component.css']
})
export class FilterTabComponent implements OnInit {

  nodeClasses: Set<string>;
  edgeClasses: Set<string>;
  classOptions: iClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  attributeType: string;
  operatorKeys: string[];
  isDateProp: boolean;
  currDatetimes: Date[];
  filteringRules: iClassBasedRules[];
  filteredTypeCount: number;
  isFilterOnDb: boolean;
  isMergeQueryResults: boolean;
  currProperties: Subject<iRuleSync> = new Subject();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _dbService: DbService, private _timebarService: TimebarService) {
    this.isFilterOnDb = true;
    this.isMergeQueryResults = true;
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
    this.classOptions = [];
    this.operatorKeys = [];
    this.selectedClassProps = [];
    this.isDateProp = false;
    this.currDatetimes = [new Date()];
    this.filteredTypeCount = 0;
    this.filteringRules = [];
  }

  ngOnInit() {
    let opt = {
      defaultDate: new Date(),
    };
    flatpickr('#filter-date-inp0', opt);

    this.classOptions.push({ text: GENERIC_TYPE.ANY_CLASS, isDisabled: false });
    this.classOptions.push({ text: GENERIC_TYPE.NODES_CLASS, isDisabled: false });
    for (const key in properties.nodes) {
      this.classOptions.push({ text: key, isDisabled: false });
      this.nodeClasses.add(key);
      if (this.selectedClassProps.length == 0) {
        this.selectedClassProps = Object.keys(properties.nodes[key]);
      }
    }

    this.classOptions.push({ text: GENERIC_TYPE.EDGES_CLASS, isDisabled: false });
    for (const key in properties.edges) {
      this.edgeClasses.add(key);
      this.classOptions.push({ text: key, isDisabled: false });
    }

    this.selectedClass = this.classOptions[1].text;
    this.changeSelectedClass();
  }

  ruleOperatorClicked(i: number, j: number, op: string) {
    if (op == 'OR') {
      this.filteringRules[i].rules[j].ruleOperator = 'AND';
    } else {
      this.filteringRules[i].rules[j].ruleOperator = 'OR';
    }
  }

  changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    let isEdgeClassSelected: boolean = properties.edges.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    this.selectedClassProps.push(GENERIC_TYPE.NOT_SELECTED);
    let isGeneric = false;
    if (isNodeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.nodes[txt]));
      this.selectedClassProps.push(...this.getEdgeTypesRelated(txt));
      isGeneric = false;
    } else if (isEdgeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.edges[txt]));
      isGeneric = false;
    } else {
      isGeneric = true;
    }
    // update properties component on the call stack later
    setTimeout(() => {
      this.currProperties.next({ properties: this.selectedClassProps, isGenericTypeSelected: isGeneric, selectedClass: this.selectedClass });
    }, 0);
  }

  private getEdgeTypesRelated(nodeType: string): string[] {
    let r: string[] = [];

    const txt = this.selectedClass.toLowerCase();
    for (let k of Object.keys(ModelDescription.relations)) {
      const v = ModelDescription.relations[k];
      if (v.source.toLowerCase() == txt || v.target.toLowerCase() == txt) {
        r.push(k);
      }
    }
    return r;
  }

  addRule2FilteringRules(r: iRule) {
    const isEdge = this.edgeClasses.has(this.selectedClass);

    let idx: number = this.filteringRules.findIndex(x => x.className == this.selectedClass);
    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (idx == -1) {
      this.filteringRules.push({ className: this.selectedClass, rules: [r], isEdge: isEdge });
    } else {
      this.filteringRules[idx].rules.push(r);
    }
  }

  deleteFilterRule(i: number, j: number) {
    if (this.filteringRules[i].rules.length == 1) {
      this.filteringRules.splice(i, 1);
    } else {
      this.filteringRules[i].rules.splice(j, 1);
    }
  }

  changeFilterRuleOrder(i: number, j: number, isUp: boolean) {
    if ((isUp && j == 0) || (!isUp && j == this.filteringRules[i].rules.length - 1)) {
      return;
    }
    let idx = j + 1;
    if (isUp) {
      idx = j - 1;
    }
    let tmp = this.filteringRules[i].rules[j];
    this.filteringRules[i].rules[j] = this.filteringRules[i].rules[idx];
    this.filteringRules[i].rules[idx] = tmp;
  }

  filterByRule(rule: iRule, ele) {
    const attr = rule.propertyOperand;
    const op = rule.operator;
    const ruleVal = rule.inputOperand;
    const eleVal = ele.data(attr);
    if (rule.propertyType === 'string' && this._g.isIgnoreCaseInText) {
      return compareUsingOperator(eleVal.toLowerCase(), ruleVal.toLowerCase(), op);
    }
    if (rule.propertyType == 'datetime') {
      return compareUsingOperator(eleVal, rule.rawInput, op);
    }
    return compareUsingOperator(eleVal, ruleVal, op);
  }

  runFilteringOnClient() {
    this._g.viewUtils.hide(this._g.cy.$());

    let filteredElems = this._g.cy.collection();
    for (let classBasedRules of this.filteringRules) {
      let allClassElems = this._g.cy.$('.' + classBasedRules.className);
      let filteredClassElems = this._g.cy.collection();
      for (let i = 0; i < classBasedRules.rules.length; i++) {
        const rule = classBasedRules.rules[i];
        if (i == 0) {
          filteredClassElems = allClassElems.filter(ele => { return this.filterByRule(rule, ele) });
          continue;
        }
        if (rule.ruleOperator == 'OR') {
          filteredClassElems.merge(allClassElems.filter(ele => { return this.filterByRule(rule, ele) }));
        } else if (rule.ruleOperator == 'AND') {
          filteredClassElems = filteredClassElems.filter(ele => { return this.filterByRule(rule, ele) });
        }
      }
      // always merge elements from different classes
      filteredElems.merge(filteredClassElems);
    }

    filteredElems.merge(filteredElems.connectedNodes());
    this._g.viewUtils.show(filteredElems);
    this._g.applyClassFiltering();
    this._timebarService.cyElemListChanged();
  }

  runFilteringOnDatabase() {
    if ($.isEmptyObject(this.filteringRules)) {
      console.log('there is no filteringRule');
      return;
    }

    const mergeContent = this.isMergeQueryResults && this._g.cy.elements().length > 0;
    this._dbService.runFilteringQuery2(this.filteringRules, (response) => this._cyService.loadElementsFromDatabase(response, mergeContent));
  }

  runFiltering() {
    if (this.isFilterOnDb) {
      this.runFilteringOnDatabase();
    } else {
      this.runFilteringOnClient();
    }
  }

  filterElesByClass(event) {
    const source = $(event.target);
    const willBeShowed = source.hasClass(FILTER_CLASS_HIDE);
    const classText = source.text();

    source.blur();
    source.toggleClass(FILTER_CLASS_HIDE);

    if (willBeShowed) {
      this._g.hiddenClasses.delete(classText);
      this._g.viewUtils.show(this._g.cy.$('.' + classText));
    }
    else {
      this._g.hiddenClasses.add(classText);
      this._g.viewUtils.hide(this._g.cy.$('.' + classText));
    }
    // this.appManager.visibilityChanged();
    this._timebarService.cyElemListChanged();
  }

}

