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

import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {QueryGroupByResource} from 'core-app/modules/hal/resources/query-group-by-resource';
import {WorkPackageQueryStateService, WorkPackageTableBaseService} from './wp-table-base.service';
import {QueryColumn} from '../../wp-query/query-column';
import {InputState} from 'reactivestates';
import {States} from 'core-components/states.service';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';
import {cloneHalResource} from 'core-app/modules/hal/helpers/hal-resource-builder';

@Injectable()
export class WorkPackageTableGroupByService
  extends WorkPackageTableBaseService<QueryGroupByResource|undefined>
  implements WorkPackageQueryStateService {
  public constructor(readonly states:States,
                     readonly tableState:TableState) {
    super(tableState);
  }

  protected get inputState():InputState<QueryGroupByResource> {
    return this.tableState.groupBy;
  }

  valueFromQuery(query:QueryResource) {
    return cloneHalResource<QueryGroupByResource>(query.groupBy);
  }

  public hasChanged(query:QueryResource) {
    const comparer = (groupBy:QueryColumn|undefined) => groupBy ? groupBy.href : null;

    return !_.isEqual(
      comparer(query.groupBy),
      comparer(this.current)
    );
  }

  public applyToQuery(query:QueryResource) {
    query.groupBy = cloneHalResource<QueryGroupByResource>(this.current);
    return true;
  }

  public isGroupable(column:QueryColumn):boolean {
    return !!_.find(this.available, candidate => candidate.id === column.id);
  }

  public set(groupBy:QueryGroupByResource|undefined) {
    // hierarchies and group by are mutually exclusive
    if (groupBy) {
      let hierarchy = this.tableState.hierarchies.value!;
      hierarchy.visible = false;
      this.tableState.hierarchies.putValue(hierarchy);
    }

    this.update(groupBy);
  }

  public setBy(column:QueryColumn) {
    let groupBy = _.find(this.available, candidate => candidate.id === column.id);

    if (groupBy) {
      this.set(groupBy);
    }
  }

  protected get currentState():QueryGroupByResource|undefined {
    return this.state.value;
  }

  protected get availableState() {
    return this.states.queries.groupBy;
  }

  public get current():QueryGroupByResource|undefined {
    if (this.currentState) {
      return this.currentState.current;
    } else {
      return undefined;
    }
  }

  public get isEnabled():boolean {
    return !!this.current;
  }

  public get available():QueryGroupByResource[] {
    return this.availableState.getValueOr([]);
  }

  public isCurrentlyGroupedBy(column:QueryColumn):boolean {
    return !!(this.current && this.current.id === column.id);
  }
}
