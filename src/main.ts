import {
  Client,
  GatewayIntentBits,
  Events,
  Message,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import PlayerRepository, {
  RepositoryConfig,
} from "./repositories/player_repository";
import { playerConfigs } from "./configs/config";
import { PlayerConfig } from "./types";
import Player from "./entities/player";
import PlayerLoginServer from "./entities/player_login_server";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const config: RepositoryConfig = {
  ttl: 60,
};
const playerRepository = new PlayerRepository(config);

client.on(Events.ClientReady, () => {
  console.log(`start bot ${client.user?.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content !== "/check-login") return;

  let players: Array<Player> = await Promise.all(
    playerConfigs.map(async (playerConfig: PlayerConfig) => {
      let player = playerRepository.get(playerConfig.id);
      if (!player) {
        const resp = await fetch(
          `${process.env.BATTLE_METRICS_ENDPOINT}/players/${playerConfig.id}?include=server`
        ).then((d) => d.json());

        const convertedPlayer = new Player(
          playerConfig.id,
          resp.data.attributes.name,
          playerConfig.name,
          getPlayerLoginServer(resp.included)
        );

        playerRepository.set(convertedPlayer);
        player = convertedPlayer;
      }
      return player;
    })
  );

  sendEmbedMessage(message, players);
});

client.login(process.env.TOKEN || "");

const getPlayerLoginServer = (
  items: Array<object>
): PlayerLoginServer | null => {
  for (let i = 0; i < items.length; i++) {
    const item: any = items[i];
    if (item.relationships.game.data.id !== "rust") continue;
    if (!item.meta.online) continue;

    return new PlayerLoginServer(
      item.attributes.name,
      item.meta.timePlayed,
      item.attributes.ip,
      item.attributes.port
    );
  }

  return null;
};

const sendEmbedMessage = (
  message: Message<boolean>,
  players: Array<Player>
) => {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("ログイン状況")
    .addFields(
      players.map((player) => {
        return {
          name: `${player.nickName}(${player.name})`,
          value: player.availableLoginServer()
            ? `
          サーバ名：${player.loginServer?.name}
          接続情報：${player.loginServer?.getConnectInfo()}
          トータルプレイ時間：${player.loginServer?.getPlayedDatetime()}
      `
            : "オフライン",
        };
      })
    );
  message.channel.send({ embeds: [embed] });
};
