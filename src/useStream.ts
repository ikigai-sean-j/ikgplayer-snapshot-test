import { type IKGPlayer } from "@ikigaians/ikgplayer";
import { useCallback, useEffect, useRef, useState } from "react";

import { initPlayerInstance } from "./streamUtils";
import { PlayerEventType } from "./types";

// const streamUrl = "https://pull-ws-test.stream.iki-utl.cc/live/sb_hd_test.flv";
const streamUrl = "https://pull-ws-test.stream.iki-utl.cc/live/sr_hd.flv";

export default function useStream() {
  const player = useRef<IKGPlayer | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<string>("");
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
        playerInstance.on(PlayerEventType.STOPPED, (args) => {
          console.warn("Video stopped", args);
        });
        playerInstance.on(PlayerEventType.ENDED, (args) => {
          console.warn("Video ended", args);
        });

        // Start loading and playing
        await playerInstance.load(streamUrl);
        await playerInstance.play();
      } catch (error) {
        console.error("Error loading or playing video:", error);
        reject(error);
      }
    });
  };

  const run = useCallback(
    async (videoEl: HTMLDivElement) => {
      if (isPlaying) return;

      if (player.current) {
        console.log("Destroying previous player in play()");
        stopAndDestroy(player.current);
        player.current = null;
      }

      player.current = initPlayerInstance(videoEl);
      if (!player.current) throw new Error("Failed to create player instance");

      await loadAndPlayVideo(player.current);
      setIsPlaying(true);
    },
    [isPlaying]
  );

  const getSnapshot = (): string => {
    try {
      if (!player.current) return "";
      const texture = player.current.snapshot("webp", 0.1);
      return texture;
    } catch (error) {
      console.warn("Error getting snapshot:", error);
      return "";
    }
  };

  const stopVideoWithSnapshot = async () => {
    setSnapshot(getSnapshot());

    if (!player.current || !isPlaying) return;

    try {
      console.log("Destroying player in stopVideoWithSnapshot()");
      stopAndDestroy(player.current);
    } catch (error) {
      console.error("Error stopping video:", error);
    } finally {
      player.current = null;
    }
  };

  const stopAndDestroy = async (playerInstance: IKGPlayer | null) => {
    if (!playerInstance) return;
    setIsPlaying(false);
    await playerInstance.stop();
    await playerInstance.destroy();
  };

  useEffect(() => {
    return () => {
      console.log("Cleaning up on unmount");
      stopAndDestroy(player.current).catch((error) => {
        console.error("Error during cleanup:", error);
      });
      player.current = null;
    };
  }, []);

  return {
    videoEl,
    setVideoEl,
    isPlaying,
    run,
    snapshot,
    setSnapshot,
    stopVideoWithSnapshot,
  };
}
