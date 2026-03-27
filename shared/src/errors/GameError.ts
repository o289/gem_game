import { ActionErrorPayload } from '../socket/events'

export class GameError extends Error implements ActionErrorPayload {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "GameError";
  }
}
