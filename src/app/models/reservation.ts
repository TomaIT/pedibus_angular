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
}
