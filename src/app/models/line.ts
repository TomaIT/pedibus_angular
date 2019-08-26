import {StopBus, StopBusType} from './stopbus';

export class Line {
  creationTime: number; // Epoch time
  deletedTime: number; // Epoch time
  emailAdmin: string;
  id: string;
  isDeleted: boolean;
  name: string;
  outStopBuses: Array<StopBus>;
  retStopBuses: Array<StopBus>;
}

export class LineEnum {
  idLine: string;
  lineName: string;
}

export class Markers {
  lat: number;
  lng: number;
  type: StopBusType;
  alpha: number;
  name: string;
  show: boolean;
}
