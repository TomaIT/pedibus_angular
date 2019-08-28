export enum Role {
  parent = 'ROLE_PARENT',
  escort = 'ROLE_ESCORT',
  admin = 'ROLE_ADMIN',
  sysAdmin = 'ROLE_SYS_ADMIN'
}

export class User {
  username: string; // Email
  roles: Array<Role>;
  idLines: Array<string>;
  enabled: boolean;
  accountNonLocked: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  firstname: string;
  surname: string;
  birth: Date;
  street: string;
  phoneNumber: string;
}

export class UserPUT {
  firstname: string;
  surname: string;
  // @DateTimeFormat(pattern = "yyyy-MM-dd")
  birth: Date;
  phoneNumber: number;
  street: string; // Photo ??
  password: string;
  verifyPassword: string;
}

export class Page<T> {
  content: Array<T>;
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  numberOfElements: number;
  last: boolean;
  first: boolean;
}

