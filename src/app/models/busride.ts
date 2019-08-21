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
