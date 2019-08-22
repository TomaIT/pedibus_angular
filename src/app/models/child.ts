export enum Gender {
  male = 'Male',
  female = 'Female'
}

export class Child {
  id: string;
  idUser: string; // Parent (creator)
  firstname: string;
  surname: string;
  birth: Date;
  gender: Gender;
  blobBase64: string; // Photo ??
  idStopBusOutDef: string;
  nameStopBusOutDef: string;
  idStopBusRetDef: string;
  nameStopBusRetDef: string;
  isDeleted: boolean;
}

export class ChildPOST {
  firstname: string;
  surname: string;
  // @DateTimeFormat(pattern = "yyyy-MM-dd")
  birth: Date;
  gender: Gender;
  blobBase64: string; // Photo ??
  idStopBusOutDef: string;
  idStopBusRetDef: string;
}
