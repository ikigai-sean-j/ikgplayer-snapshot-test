import type { AVPlayerOptions } from "@ikigaians/ikgplayer";
import { IKGPlayerFactory, type IKGPlayer } from "@ikigaians/ikgplayer";
import { useCallback, useEffect, useRef, useState } from "react";

const initPlayerInstance = (videoEl: HTMLDivElement) => {
  const { origin, pathname } = window.location;
  const options: AVPlayerOptions = {
    wasmBaseUrl: `${origin}${pathname}libmedia/wasm`,
    container: videoEl,
    isLive: true,
  };
  return IKGPlayerFactory.create("libmedia", options);
};

enum PlayerEventType {
  LOADING = "loading",
  LOADED = "loaded",
  PLAYING = "playing",
  PLAYED = "played",
  PAUSED = "paused",
  STOPPED = "stopped",
  ENDED = "ended",
  SEEKING = "seeking",
  SEEKED = "seeked",
  CHANGING = "changing",
  CHANGED = "changed",
  TIMEOUT = "timeout",
  ERROR = "error",
  TIME = "time",
  RESUME = "resume",
  FIRST_AUDIO_RENDERED = "firstAudioRendered",
  FIRST_VIDEO_RENDERED = "firstVideoRendered",
  STREAM_UPDATE = "streamUpdate",
  PROGRESS = "progress",
  VOLUME_CHANGE = "volumeChange",
  SUBTITLE_DELAY_CHANGE = "subtitleDelayChange",
}

const streamUrl = "https://pull-ws-test.stream.iki-utl.cc/live/sr_hd.flv";

export default function useStream() {
  const player = useRef<IKGPlayer | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const loadAndPlayVideo = (playerInstance: IKGPlayer): Promise<void> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Set up event listeners first
        const onFirstFrame = () => {
          console.log("First video frame rendered");
          // Register all the callbacks for player operation
          resolve();
        };

        // Set up error listener
        const onError = (error: unknown) => {
          console.error("Error in player:", error);
          reject(error);
        };

        // Register the listeners
        playerInstance.on(PlayerEventType.FIRST_VIDEO_RENDERED, onFirstFrame);
        playerInstance.on(PlayerEventType.ERROR, onError);

        console.log("Loading video from URL:", streamUrl);
        // Start loading and playing
        await playerInstance.load(streamUrl);
        await playerInstance.play();
      } catch (error) {
        console.error("Error loading or playing video:", error);
        reject(error);
      }
    });
  };

  const run = useCallback(async (videoEl: HTMLDivElement) => {
    player.current = initPlayerInstance(videoEl);
    if (!player.current) throw new Error("Failed to create player instance");

    await loadAndPlayVideo(player.current);
    setIsPlaying(true);
  }, []);

  const cleanupPlayer = async () => {
    const currentPlayer = player.current;
    if (!currentPlayer) return;

    console.log("Cleaning up player instance");
    await currentPlayer.stop();
    await currentPlayer.destroy();
    player.current = null;
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!videoEl || isLoading || isPlaying) return;

    setIsLoading(true);
    run(videoEl).catch((error) => {
      console.error("Error in useStream:", error);
      setIsPlaying(false);
    });
  }, [isLoading, isPlaying, run, videoEl]);

  useEffect(() => {
    return () => {
      console.log("Cleaning up on unmount");
      cleanupPlayer().catch((error) => {
        console.error("Error during cleanup:", error);
      });
    };
  }, []);

  return { setVideoEl, snapshot, isPlaying };
}
