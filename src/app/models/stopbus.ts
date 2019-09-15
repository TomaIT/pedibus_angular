export enum StopBusType {
  return = 'Return',
  outward = 'Outward'
}

export class GeoJsonPoint {
  coordinates: Array<number>;
  type: string;
  x: number;
  y: number;
}

export class StopBus {
  hours: number;
  id: string;
  location: GeoJsonPoint;
  name: string;
  stopBusType: StopBusType;
  lineName: string;
  idLine: string;
}

export class SelectedStopBus {
  stopBus: StopBus;
  selected: boolean;
}
