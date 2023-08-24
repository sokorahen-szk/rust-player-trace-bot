import {
  Client,
  GatewayIntentBits,
  Events,
  Message,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";
import axis from "axios";
import PlayerRepository, {
  RepositoryConfig,
} from "./repositories/player_repository";
import BattleMetricsRepository from "./repositories/internal/battle_metrics_repository";
import { playerConfigs } from "./configs/config";
import { PlayerConfig } from "./types";
import Player from "./entities/player";
import PlayerLoginServer from "./entities/player_login_server";
import axios from "axios";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const config: RepositoryConfig = {
  ttl: parseInt(process.env.CACHE_TTL_MINUTES || "60"),
};
const playerRepository = new PlayerRepository(config);
const battleMetricsRepository = new BattleMetricsRepository(axios);

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
        const playerWithLoginServerInfo =
          await battleMetricsRepository.getPlayerWithLoginServerInfo(
            playerConfig.id
          );

        let playerLoginServer: PlayerLoginServer | null = null;
        if (playerWithLoginServerInfo.loginServerInfo) {
          playerLoginServer = new PlayerLoginServer(
            playerWithLoginServerInfo.loginServerInfo?.name,
            playerWithLoginServerInfo.loginServerInfo?.timePlayed,
            playerWithLoginServerInfo.loginServerInfo?.host,
            playerWithLoginServerInfo.loginServerInfo?.port
          );
        }

        const convertedPlayer = new Player(
          playerConfig.id,
          playerWithLoginServerInfo.playerName,
          playerConfig.name,
          playerLoginServer
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

const sendEmbedMessage = (
  message: Message<boolean>,
  players: Array<Player>
) => {
  let onlineCount = 0;
  players.forEach((player) => {
    if (player.availableLoginServer()) {
      onlineCount++;
    }
  });

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`ログイン状況 (${onlineCount}/${players.length})`)
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
