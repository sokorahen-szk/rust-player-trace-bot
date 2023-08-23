import Player from "../entities/player";
import PlayerLoginServer from "../entities/player_login_server";

export const toPlayer = (
  playerId: string,
  playerName: string,
  playerNickName: string,
  serverName: string | null,
  serverPlayedTime: number | null,
  serverHost: string | null,
  serverPort: number | null
): Player => {
  return new Player(
    playerId,
    playerName,
    playerNickName,
    serverName && serverPlayedTime && serverHost && serverPort
      ? new PlayerLoginServer(
          serverName,
          serverPlayedTime,
          serverHost,
          serverPort
        )
      : null
  );
};
