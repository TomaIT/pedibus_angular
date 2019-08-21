import {User} from './user';

export class Login {
  username: string;
  jwtToken: string;
  expiredEpochTime: number;
  user: User;
}
