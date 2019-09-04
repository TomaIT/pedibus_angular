import {StopBus, StopBusType} from './stopbus';

export class BusRide {
  id: string;
  idLine: string;
  lineName: string;
  stopBusType: StopBusType;
  stopBuses: Array<StopBus>;
  year: number;
  month: number;
  day: number;
  startTime: Date; // Data:ora in cui inizia la corsa
  isEnabled: boolean; // Stato che indica la cancellazione
  idReservations: Array<string>; // Prenotazioni per tale corsa
  timestampLastStopBus: number; // Epoch time
  idLastStopBus: string;
}

export class BusRidePUT {
  idLastStopBus: string;
  timestampLastStopBus: number;
}

export class BusRidePost {
  day: number;
  month: number;
  year: number;
  stopBusType: StopBusType;
  idLine: string;
}
