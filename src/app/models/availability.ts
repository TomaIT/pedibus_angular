import {BusRide} from './busride';

export enum AvailabilityState {
  available = 'Available', // Escort è disponibile a coprire quella corsa
  checked = 'Checked', // Admin ha confermato, e attende che Escort riconfermi la sua disponibilità
  readChecked = 'ReadChecked', // Escort conferma la diponibilità.
  confirmed = 'Confirmed'  // Admin chiude la disponibilità, essa non cambierà più
 /* OLD VERSION
  available = 'Available', // Escort è disponibile a coprire quella corsa
  checked = 'Checked', // Admin ha confermato, e attende che Escort riconfermi la sua disponibilità
  confirmed = 'Confirmed' // Escort conferma infine la diponibilità, essa non cambierà più.
 */
}

export class Availability {
  id: string;
  idBusRide: string;
  idStopBus: string;
  idUser: string; // Escort
  state: AvailabilityState;
  busRide: BusRide;
}
