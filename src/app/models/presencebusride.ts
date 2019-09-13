import {StopBusType} from './stopbus';
import {ReservationState} from './reservation';

export class PresenceChild {
  idChild: string;
  nameChild: string;
  booked: boolean;
  idReservation: string;
  getIn: ReservationState;
  getOut: ReservationState;
  absent: ReservationState;
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
