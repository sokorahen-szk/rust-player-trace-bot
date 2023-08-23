import PlayerLoginServer from "./player_login_server";

export default class Player {
  public id: string;
  public name: string;
  public nickName: string;
  public loginServer: PlayerLoginServer | null;
  public constructor(
    id: string,
    name: string,
    nickName: string,
    loginServer: PlayerLoginServer | null
  ) {
    this.id = id;
    this.name = name;
    this.nickName = nickName;
    this.loginServer = loginServer;
  }

  public availableLoginServer(): boolean {
    return this.loginServer !== null;
  }
}
