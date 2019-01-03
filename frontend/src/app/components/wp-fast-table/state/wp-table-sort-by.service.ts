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

import {States} from 'core-components/states.service';
import {combine, InputState} from 'reactivestates';
import {mapTo} from 'rxjs/operators';
import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {QueryColumn} from '../../wp-query/query-column';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';
import {WorkPackageQueryStateService, WorkPackageTableBaseService} from './wp-table-base.service';
import {Observable} from 'rxjs';
import {
  QUERY_SORT_BY_ASC, QUERY_SORT_BY_DESC,
  QuerySortByResource
} from 'core-app/modules/hal/resources/query-sort-by-resource';
import {cloneHalResourceCollection} from 'core-app/modules/hal/helpers/hal-resource-builder';

@Injectable()
export class WorkPackageTableSortByService
  extends WorkPackageTableBaseService<QuerySortByResource[]>
  implements WorkPackageQueryStateService {

  constructor(readonly states:States,
              readonly tableState:TableState) {
    super(tableState);
  }


  public valueFromQuery(query:QueryResource) {
    return cloneHalResourceCollection<QuerySortByResource>(query.sortBy);
  }

  public onReadyWithAvailable():Observable<null> {
    return combine(this.state, this.states.queries.sortBy)
      .values$()
      .pipe(
        mapTo(null)
      );
  }

  public hasChanged(query:QueryResource) {
    const comparer = (sortBy:QuerySortByResource[]) => sortBy.map(el => el.href);

    return !_.isEqual(
      comparer(query.sortBy),
      comparer(this.current)
    );
  }

  public applyToQuery(query:QueryResource) {
    if (this.current.length > 0) {
      // hierarchies and sort by are mutually exclusive
      var hierarchies = this.tableState.hierarchies.value!;
      hierarchies.visible = false;
      hierarchies.last = null;
      this.tableState.hierarchies.putValue(hierarchies);
      query.hierarchies = hierarchies.visible;
    }
    query.sortBy = cloneHalResourceCollection<QuerySortByResource>(this.current);
    return true;
  }

  public isSortable(column:QueryColumn):boolean {
    return !!_.find(
      this.available,
      (candidate) => candidate.column.$href === column.$href
    );
  }

  public addAscending(column:QueryColumn) {
    let available = this.findAvailableDirection(column, QUERY_SORT_BY_ASC);

    if (available) {
      this.add(available);
    }
  }

  public addDescending(column:QueryColumn) {
    let available = this.findAvailableDirection(column, QUERY_SORT_BY_DESC);

    if (available) {
      this.add(available);
    }
  }

  public findAvailableDirection(column:QueryColumn, direction:string):QuerySortByResource | undefined {
    return _.find(
      this.available,
      (candidate) => (candidate.column.$href === column.$href &&
        candidate.direction.$href === direction)
    );
  }

  public add(sortBy:QuerySortByResource) {
    this.inputState.doModify((current:QuerySortByResource[]) => {
      current.unshift(sortBy);

      return _.uniqBy(current,
        sortBy => sortBy.column.$href)
        .slice(0, 3);
    });
  }

  public set(sortBys:QuerySortByResource[]) {
    this.inputState.doModify((current:QuerySortByResource[]) => {
      return _.uniqBy(sortBys,
        sortBy => sortBy.column.$href)
        .slice(0, 3);
    });
  }

  public get current() {
    return this.state.getValueOr([]);
  }

  public get availableState() {
    return this.states.queries.sortBy;
  }

  public get available():QuerySortByResource[] {
    return this.availableState.getValueOr([]);
  }

  protected get inputState():InputState<QuerySortByResource[]> {
    return this.tableState.sortBy;
  }
}
