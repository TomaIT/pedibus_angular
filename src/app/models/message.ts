export class Message {
  id: string;
  idUserFrom: string;
  idUserTo: string;
  subject: string;
  readConfirm: number; // Epoch Time
  message: string;
  creationTime: number; // Epoch Time
}
