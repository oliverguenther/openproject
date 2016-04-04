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

export class WorkPackageInlineCreateController {

  public rowLength:int;
  public text:Object;

  private _allowed:boolean = false;

  constructor(protected I18n, protected ProjectService) {
    this.text = {
      addWorkPackageLabel: I18n.t('js.label_work_package'),
      addWorkPackageTitle: I18n.t('js.work_packages.inline_create.title')
    };

    this.rowLength = this.columns.length + 2;
  }

  public isAllowed() {
    ProjectService.fetchProjectResource(vm.projectIdentifier).then(project => {
      this.allowed = !!project.links.createWorkPackage;
    });

    return _allowed;
  }

  public addNewWorkPackageRow() {
    // TODOS
    // 1. POST empty /api/v3/work_packages/form with first type for empty resource
    // 2. Add the resulting wp resource to rows
    // 3. Activate inline edit for all required fields
    // 4. Focus into first required field
    // 5. When pressing <enter>, start with 1.
  }
}



function wpInlineCreate() {
  return {
    restrict: 'A',

    scope: {
      columns: '=',
      rows: '='
    },

    controller: WorkPackageInlineCreateController,
    controllerAs: 'vm',
    templateUrl: '/components/wp-edit/wp-inline-create-button.directive.html',
    bindToController: true
  };
}

angular
  .module('openproject')
  .directive('wpInlineCreate', wpInlineCreate);
