import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'type-form-attribute-group',
  templateUrl: './attribute-group.component.html'
})
export class TypeFormAttributeGroupComponent {
  @Input() public group:any;
  @Output() public deleteGroup = new EventEmitter<void>();
}
