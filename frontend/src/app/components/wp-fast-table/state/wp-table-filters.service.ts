// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {WorkPackageQueryStateService, WorkPackageTableBaseService} from './wp-table-base.service';
import {Injectable} from '@angular/core';
import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {QuerySchemaResource} from 'core-app/modules/hal/resources/query-schema-resource';
import {QueryFilterInstanceResource} from 'core-app/modules/hal/resources/query-filter-instance-resource';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {InputState} from 'reactivestates';
import {cloneHalResourceCollection} from 'core-app/modules/hal/helpers/hal-resource-builder';
import {States} from 'core-components/states.service';
import {QueryFilterResource} from 'core-app/modules/hal/resources/query-filter-resource';
import {QueryFilterInstanceSchemaResource} from 'core-app/modules/hal/resources/query-filter-instance-schema-resource';

@Injectable()
export class WorkPackageTableFiltersService
  extends WorkPackageTableBaseService<QueryFilterInstanceResource[]>
  implements WorkPackageQueryStateService {

  public readonly hidden:string[] = [
    'id',
    'parent',
    'datesInterval',
    'precedes',
    'follows',
    'relates',
    'duplicates',
    'duplicated',
    'blocks',
    'blocked',
    'partof',
    'includes',
    'requires',
    'required',
  ];

  constructor(readonly tableState:TableState,
              readonly states:States) {
    super(tableState);
  }

  protected get inputState():InputState<QueryFilterInstanceResource[]> {
    return this.tableState.filters;
  }

  /**
   * Do not fill initial filter values because we require
   * the associated schema to be loaded.
   * @param query
   */
  public valueFromQuery(query:QueryResource) {
    return undefined;
  }

  public initializeFilters(query:QueryResource, schema:QuerySchemaResource) {
    let filters = query.filters.map( filter => filter.$copy<QueryFilterInstanceResource>());

    this.loadCurrentFiltersSchemas(filters).then(() => {
      // let newState = new WorkPackageTableFilters(filters, schema.filtersSchemas.elements);

      this.update(filters);
    });
  }

  public hasChanged(query:QueryResource) {
    const comparer = (filter:QueryFilterInstanceResource[]) => filter.map(el => el.$source);

    return !_.isEqual(
      comparer(query.filters),
      comparer(this.current)
    );
  }

  public applyToQuery(query:QueryResource) {
    query.filters = this.current;
    return true;
  }

  public get current():QueryFilterInstanceResource[] {
    return this.state.getValueOr([]);
  }

  public cloneCurrent():QueryFilterInstanceResource[] {
    return cloneHalResourceCollection<QueryFilterInstanceResource>(this.current);
  }

  public updateIfComplete(newState:QueryFilterInstanceResource[] ) {
    if (this.isComplete()) {
      this.update(newState);
    }
  }

  public add(filter:QueryFilterResource, mapper?:(filter:QueryFilterInstanceResource) => QueryFilterInstanceResource) {
    let schema = _.find(this.availableSchemas,
      schema => (schema.filter.allowedValues as QueryFilterResource[])[0].href === filter.href)!;

    mapper = mapper || _.identity;
    let newFilter = mapper(schema.getFilter());

    this.inputState.doModify((filters) => [...filters, newFilter]);
  }

  public remove(filter:QueryFilterInstanceResource) {
    let index = this.current.indexOf(filter);
    this.inputState.doModify((value) => value.splice(index, 1));
  }

  public get remainingFilters() {
    let activeFilterHrefs = this.currentFilters.map(filter => filter.href);

    return _.remove(this.availableFilters, filter => activeFilterHrefs.indexOf(filter.href) === -1);
  }

  public get remainingVisibleFilters() {
    return this.remainingFilters
      .filter((filter) => this.hidden.indexOf(filter.id) === -1);
  }

  public get currentVisibleFilters() {
    return this.currentFilters
      .filter((filter) => this.hidden.indexOf(filter.id) === -1);
  }

  private get currentFilters():QueryFilterResource[] {
    return this.current.map((filter:QueryFilterInstanceResource) => filter.filter);
  }

  public get availableFilters() {
    return this.availableSchemas
      .map(schema => (schema.filter.allowedValues as QueryFilterResource[])[0]);
  }

  public isComplete():boolean {
    return this.current.every( filter => !!filter.isCompletelyDefined());
  }

  private loadCurrentFiltersSchemas(filters:QueryFilterInstanceResource[]):Promise<{}> {
    return Promise.all(filters.map(filter => filter.schema.$load()));
  }

  // Get available schemas
  protected get availableSchemas():QueryFilterInstanceSchemaResource[] {
    return this.schemasState.getValueOr([]);
  }

  // Get the available state
  protected get schemasState() {
    return this.states.queries.filterSchemas;
  }
}
