export class ReservationState {
  idStopBus: string;
  epochTime: number;
  idUser: string; // Escort
}

export class Reservation {
  id: string;
  idBusRide: string;
  idChild: string;
  idStopBus: string;
  idUser: string;
  getIn: ReservationState;
  getOut: ReservationState;
}
