export interface WorkPackageTableHierarchies {
  visible:boolean;
  last:string|null;
  collapsed:{ [workPackageId:string]:boolean };
}

