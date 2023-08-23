import { secondsToHMS } from "../lib/time";

export default class PlayerLoginServer {
  public name: string;
  public playedTime: number;
  public host: string;
  public port: number;
  constructor(name: string, playedTime: number, host: string, port: number) {
    this.name = name;
    this.playedTime = playedTime;
    this.host = host;
    this.port = port;
  }

  public getPlayedDatetime(): string {
    return secondsToHMS(this.playedTime);
  }

  public getConnectInfo(): string {
    return `${this.host}:${this.port}`;
  }

  public isOnline(): boolean {
    return this.name !== "";
  }

  public isInvalid(): boolean {
    return (
      this.name === undefined ||
      this.name === null ||
      this.playedTime === undefined ||
      this.playedTime === null ||
      this.host === undefined ||
      this.host === null ||
      this.port === undefined ||
      this.port === null
    );
  }
}
