import NodeCache from "node-cache";
import Player from "../entities/player";
import { toPlayer } from "./convert_entity";

export interface RepositoryConfig {
  ttl: number;
}

export default class PlayerRepository {
  client: NodeCache;
  public constructor(config: RepositoryConfig) {
    this.client = new NodeCache({ stdTTL: config.ttl });
  }

  public get(playerId: string): Player | undefined {
    const json: string | undefined = this.client.get(playerId);
    if (json) {
      const item: any = JSON.parse(json);
      return toPlayer(
        item.id,
        item.name,
        item.nickName,
        item.loginServer?.name || null,
        item.loginServer?.playedTime || null,
        item.loginServer?.host || null,
        item.loginServer?.port || null
      );
    }

    return undefined;
  }

  public set(player: Player) {
    this.client.set(player.id, JSON.stringify(player));
  }
}
