import type { AVPlayerOptions } from "@ikigaians/ikgplayer";
import { IKGPlayerFactory, type IKGPlayer } from "@ikigaians/ikgplayer";
import { PlayerEventType, PlayerStatus } from "./types";

export const initPlayerInstance = (videoEl: HTMLDivElement) => {
  const { origin, pathname } = window.location;
  const options: AVPlayerOptions = {
    wasmBaseUrl: `${origin}${pathname}libmedia/wasm`,
    container: videoEl,
    isLive: true,
  };
  return IKGPlayerFactory.create("libmedia", options);
};

export const getPlayerStatus = (player: IKGPlayer) => {
  const status = player.getStatus();
  const statusString = PlayerStatus[status];
  return { status, statusString };
};

export const regPlayerListeners = (
  player: IKGPlayer,
  callback: (event: PlayerEventType) => void
) => {
  player.on(PlayerEventType.FIRST_VIDEO_RENDERED, () => {
    callback(PlayerEventType.FIRST_VIDEO_RENDERED);
  });
  player.on(PlayerEventType.ERROR, () => {
    callback(PlayerEventType.ERROR);
  });
  player.on(PlayerEventType.STOPPED, () => {
    callback(PlayerEventType.STOPPED);
  });
  player.on(PlayerEventType.ENDED, () => {
    callback(PlayerEventType.ENDED);
  });
};

export const load = async (streamUrl: string, player: IKGPlayer) => {
  try {
    await player.load(streamUrl);
  } catch (error) {
    console.error("Error loading stream:", error);
  }
};

export const play = async (player: IKGPlayer) => {
  try {
    await player.play();
  } catch (error) {
    console.error("Error playing stream:", error);
  }
};

export const resume = async (player: IKGPlayer) => {
  try {
    await player.resume();
  } catch (error) {
    console.error("Error resuming stream:", error);
  }
};

export const stop = async (player: IKGPlayer) => {
  try {
    await player.stop();
  } catch (error) {
    console.error("Error stopping stream:", error);
  }
};

export const destroy = async (player: IKGPlayer) => {
  try {
    await player.destroy();
  } catch (error) {
    console.error("Error destroying player:", error);
  }
};

export const getSnapshot = (player: IKGPlayer) => {
  try {
    return player.snapshot("png", 0.2);
  } catch (error) {
    console.error("Error taking snapshot:", error);
  }
};
