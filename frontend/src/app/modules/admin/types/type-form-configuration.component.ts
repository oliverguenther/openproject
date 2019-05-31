import {Component, ElementRef, OnInit} from '@angular/core';
import {TypeBannerService} from 'core-app/modules/admin/types/type-banner.service';
import {I18nService} from 'core-app/modules/common/i18n/i18n.service';
import {NotificationsService} from 'core-app/modules/common/notifications/notifications.service';
import {ExternalRelationQueryConfigurationService} from 'core-components/wp-table/external-configuration/external-relation-query-configuration.service';
import {DomAutoscrollService} from 'core-app/modules/common/drag-and-drop/dom-autoscroll.service';
import {DragulaService} from 'ng2-dragula';
import {ConfirmDialogService} from 'core-components/modals/confirm-dialog/confirm-dialog.service';
import {Drake} from 'dragula';
import {randomString} from 'core-app/helpers/random-string';

export type TypeGroupType = 'attribute'|'query';

export interface TypeGroup {
  id:string|null;
  key:string;
  originalKey:string;
  name:string;
  query?:any;
  type:TypeGroupType;
}

@Component({
  selector: 'admin-type-form-configuration',
  templateUrl: './type-form-configuration.html',
  providers: [
    TypeBannerService,
  ]
})
export class TypeFormConfigurationComponent implements OnInit {

  public text = {
    drag_to_activate: this.I18n.t('js.admin.type_form.drag_to_activate'),
    reset: this.I18n.t('js.admin.type_form.reset'),
    label_group: this.I18n.t('js.label_group'),
    add_group: this.I18n.t('js.admin.type_form.add_group'),
    add_table: this.I18n.t('js.admin.type_form.add_table'),
  };

  private autoscroll:any;
  private element:HTMLElement;
  private form:JQuery;

  public groups:TypeGroup[] = [];

  private attributeDrake:Drake;
  private groupsDrake:Drake;

  constructor(private elementRef:ElementRef,
              private I18n:I18nService,
              private dragula:DragulaService,
              private confirmDialog:ConfirmDialogService,
              private notificationsService:NotificationsService,
              private externalRelationQuery:ExternalRelationQueryConfigurationService) {
  }

  ngOnInit():void {
    // Hook on form submit
    this.element = this.elementRef.nativeElement;
    this.form = jQuery(this.element).closest('form');
    this.form.on('submit.typeformupdater', () => {
      return !this.updateHiddenFields();
    });

    // Setup autoscroll
    const that = this;
    this.autoscroll = new DomAutoscrollService(
      [
        document.getElementById('content-wrapper')!
      ],
      {
        margin: 25,
        maxSpeed: 10,
        scrollWhenOutside: true,
        autoScroll: function(this:any) {
          const groups = that.groupsDrake && that.groupsDrake.dragging;
          const attributes = that.attributeDrake && that.attributeDrake.dragging;
          return this.down && (groups || attributes);
        }
      });

    // Setup dragula
    this.groupsDrake = this.setupGroups();
    this.attributeDrake = this.setupAttributes();
  }

  public deactivateAttribute($event:any) {
    jQuery($event.target)
      .parents('.type-form-conf-attribute')
      .appendTo('#type-form-conf-inactive-group .attributes');
    this.updateHiddenFields();
  }

  public addGroupAndOpenQuery():void {
    let newGroup = this.createGroup('query');
    this.editQuery(newGroup);
  }

  public editQuery(group:TypeGroup) {
    let originator = group.find('.type-form-query');

    // Disable display mode and timeline for now since we don't want users to enable it
    const disabledTabs = {
      'display-settings': I18n.t('js.work_packages.table_configuration.embedded_tab_disabled'),
      'timelines': I18n.t('js.work_packages.table_configuration.embedded_tab_disabled')
    };

    this.externalRelationQueryConfiguration.show(
      group.query,
      (queryProps:any) => group.query = queryProps,
      disabledTabs
    );
  };

  public deleteGroup($event:any) {
    let group:JQuery = angular.element($event.target).parents('.type-form-conf-group');
    let attributes:JQuery = angular.element('.attributes', group).children();
    let inactiveAttributes:JQuery = angular.element('#type-form-conf-inactive-group .attributes');

    inactiveAttributes.prepend(attributes);

    group.remove();
    this.updateHiddenFields();
    return group;
  }

  public createGroup(type:TypeGroupType, groupName:string = '') {
    let draggableGroups:JQuery = angular.element('#draggable-groups');
    let randomId:string = randomString(8);

    let group:TypeGroup = {
      type: type,
      name: groupName,
      id: null,
      key: randomId,
      originalKey: randomId
    };

    this.groups.unshift(group);
    return group;
  }

  public resetToDefault($event:JQuery.Event):boolean {
    this.confirmDialog
      .confirm({
        text: {
          title: this.I18n.t('js.types.attribute_groups.reset_title'),
          text: this.I18n.t('js.types.attribute_groups.confirm_reset'),
          button_continue: this.I18n.t('js.label_reset')
        }
      }).then(() => {
      this.form.find('input#type_attribute_groups').val(JSON.stringify([]));

      // Disable our form handler that updates the attribute groups
      this.form.off('submit.typeformupdater');
      this.form.trigger('submit');
    });

    $event.preventDefault();
    return false;
  }

  protected setupGroups() {
    return dragula(
      this.element.querySelector('#draggable-groups')!,
     {
      moves: (el:HTMLElement) => el.classList.contains('type-form-conf-group'),
      direction: 'vertical',
      copy: false,
      revertOnSpill: true,
      removeOnSpill: false,
      mirrorContainer: document.body,
      ignoreInputTextSelection: true
    });
  }

}
