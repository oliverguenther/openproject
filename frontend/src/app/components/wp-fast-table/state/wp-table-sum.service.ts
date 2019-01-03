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

import {InputState} from 'reactivestates';
import {WorkPackageQueryStateService, WorkPackageTableBaseService} from './wp-table-base.service';
import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';

@Injectable()
export class WorkPackageTableSumService
  extends WorkPackageTableBaseService<boolean>
  implements WorkPackageQueryStateService {

  public constructor(tableState:TableState) {
    super(tableState);
  }

  public valueFromQuery(query:QueryResource) {
    return !!query.sums;
  }

  public initialize(query:QueryResource) {
    this.update(!!query.sums);
  }

  public hasChanged(query:QueryResource) {
    return query.sums !== this.isEnabled;
  }

  public applyToQuery(query:QueryResource) {
    query.sums = this.isEnabled;
    return true;
  }

  public toggle(newValue:boolean|undefined) {
    if (newValue === undefined) {
      newValue = !this.current;
    }

    this.update(newValue);
  }

  public setEnabled(value:boolean) {
    this.update(value);
  }

  public get isEnabled() {
    return this.current;
  }

  protected get inputState() {
    return this.tableState.sum;
  }

  private get current():boolean {
    return this.state.getValueOr(false);
  }
}
