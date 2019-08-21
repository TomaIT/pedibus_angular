export enum Role {
  ROLE_SYS_ADMIN,
  ROLE_ADMIN,
  ROLE_ESCORT,
  ROLE_PARENT
}

export class User {
  username: string; // Email
  roles: Array<Role>;
  idLines: Array<string>;
  isAccountNonExpired: boolean;
  isAccountNonLocked: boolean;
  isCredentialsNonExpired: boolean;
  isEnabled: boolean;
  firstname: string;
  surname: string;
  birth: Date;
  street: string;
  phoneNumber: string;
}
