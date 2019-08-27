import {StopBusType} from './stopbus';

export class PresenceChild {
  idChild: string;
  nameChild: string;
  isBooked: boolean;
  idReservation: string;
  isGetIn: boolean;
  isGetOut: boolean;
  isAbsent: boolean;
}

export class PresenceStopBus {
  idStopBus: string;
  nameStopBus: string;
  hours: Date;
  presenceChildGETSet: Array<PresenceChild>;
}

export class PresenceBusRide {
  idLine: string;
  lineName: string;
  idBusRide: string;
  stopBusType: StopBusType;
  idLastStopBus: string;
  nameLastStopBus: string;
  presenceStopBusGETTreeSet: Array<PresenceStopBus>;
}
