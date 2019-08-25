import {Child} from './child';

export class ReservationState {
  idStopBus: string;
  epochTime: number;
  idUser: string; // Escort
}

export class Reservation {
  id: string;
  idBusRide: string;
  idChild: string;
  child: Child;
  idStopBus: string;
  idUser: string;
  getIn: ReservationState;
  getOut: ReservationState;
  absent: ReservationState;
  isGetIn = false;
  isGetOut = false;
  isAbsent = false;
}

export class ReservationPOST {
  idBusRide: string;
  idChild: string;
  idStopBus: string;
}

export enum EnumChildGet {
  getIn = 'GetIn',
  getOut = 'GetOut',
  absent = 'Absent'
}

export class ReservationPUT {
  enumChildGet: EnumChildGet;
  epochTime: number;
  idStopBus: string;
}
