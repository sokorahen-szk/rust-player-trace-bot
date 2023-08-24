import { AxiosStatic } from "axios";

export interface LoginServerInfo {
  name: string;
  timePlayed: number;
  host: string;
  port: number;
}

export interface GetPlayerResponse {
  playerId: string;
  playerName: string;
  loginServerInfo: LoginServerInfo | null;
}

export default class BattleMetricsRepository {
  private client: AxiosStatic;
  public constructor(client: AxiosStatic) {
    this.client = client;
  }

  public async getPlayerWithLoginServerInfo(
    playerId: string
  ): Promise<GetPlayerResponse> {
    const result: any = await this.client
      .get(
        `${process.env.BATTLE_METRICS_ENDPOINT}/players/${playerId}?include=server`
      )
      .then((d) => {
        return d.data;
      });

    const resp: GetPlayerResponse = {
      playerId: playerId,
      playerName: result.data.attributes.name,
      loginServerInfo: this.filterOnlineServerInfo(result.included),
    };
    return resp;
  }

  private filterOnlineServerInfo = (
    items: Array<object>
  ): LoginServerInfo | null => {
    for (let i = 0; i < items.length; i++) {
      const item: any = items[i];
      if (item.relationships.game.data.id !== "rust") continue;
      if (!item.meta.online) continue;

      const res: LoginServerInfo = {
        name: item.attributes.name,
        timePlayed: item.meta.timePlayed,
        host: item.attributes.ip,
        port: item.attributes.port,
      };

      return res;
    }

    return null;
  };
}
