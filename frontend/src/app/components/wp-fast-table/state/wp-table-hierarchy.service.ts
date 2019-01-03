import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {InputState} from 'reactivestates';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';
import {
  WorkPackageQueryStateService,
  WorkPackageTableBaseService
} from 'core-components/wp-fast-table/state/wp-table-base.service';
import {WorkPackageTableHierarchies} from 'core-components/wp-fast-table/state/wp-table-hierarchy.interface';

@Injectable()
export class WorkPackageTableHierarchiesService
  extends WorkPackageTableBaseService<WorkPackageTableHierarchies>
  implements WorkPackageQueryStateService {
  public constructor(tableState:TableState) {
    super(tableState);
  }

  protected get inputState():InputState<WorkPackageTableHierarchies> {
    return this.tableState.hierarchies as InputState<WorkPackageTableHierarchies>;
  }

  protected initialState(visible:boolean) {
    return {
      visible: visible,
      last: null,
      collapsed: {}
    };
  }

  public valueFromQuery(query:QueryResource):WorkPackageTableHierarchies {
    return this.initialState(query.showHierarchies);
  }

  public hasChanged(query:QueryResource) {
    return query.showHierarchies !== this.isEnabled;
  }

  public applyToQuery(query:QueryResource) {
    query.showHierarchies = this.isEnabled;

    // We need to visibly load the ancestors when the mode is activated.
    return this.isEnabled;
  }

  /**
   * Return whether the current hierarchy mode is active
   */
  public get isEnabled():boolean {
    return this.current.visible;
  }

  public get current():WorkPackageTableHierarchies {
    return this.state.getValueOr(this.initialState(false));
  }

  public setEnabled(active:boolean = true) {
    const state = this.current;
    state.visible = active;
    state.last = null;

    if (active) {
      // hierarchies and group by are mutually exclusive
      var groupBy = this.tableState.groupBy.putValue(undefined);

      // hierarchies and sort by are mutually exclusive
      this.tableState.sortBy.putValue([]);
    }

    this.update(state);
  }

  /**
   * Toggle the hierarchy state
   */
  public toggleState() {
    this.setEnabled(!this.isEnabled);
  }

  /**
   * Return whether the given wp ID is collapsed.
   */
  public collapsed(wpId:string):boolean {
    return this.current.collapsed[wpId];
  }

  /**
   * Collapse the hierarchy for this work package
   */
  public collapse(wpId:string):void {
    this.setState(wpId, true);
  }

  /**
   * Expand the hierarchy for this work package
   */
  public expand(wpId:string):void {
    this.setState(wpId, false);
  }

  /**
   * Toggle the hierarchy state
   */
  public toggle(wpId:string):void {
    this.setState(wpId, !this.collapsed(wpId));
  }

  /**
   * Set the collapse/expand state of the given work package id.
   */
  private setState(wpId:string, isCollapsed:boolean):void {
    this.inputState.doModify(state => {
      let newState = { ...state, last: wpId };
      newState.collapsed[wpId] = isCollapsed;
      return newState;
    });
  }
}
