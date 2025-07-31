import { useEffect, useCallback, type Ref } from "react";

import "./App.css";
import useStream from "./useStream";

function App() {
  const streamData = useStream();
  const { videoEl, setVideoEl, run, isPlaying } = streamData;
  const { snapshot, setSnapshot, stopVideoWithSnapshot } = streamData;

  useEffect(() => {
    if (!videoEl) return;
    if (isPlaying || (!isPlaying && snapshot)) return;

    console.log("Running stream with video element");
    run(videoEl).catch((error) => {
      console.error("Error in useStream:", error);
    });
  }, [isPlaying, run, snapshot, videoEl]);

  useEffect(() => {
    if (!isPlaying) return;
    console.log("Video is playing");
  }, [isPlaying]);

  useEffect(() => {
    if (snapshot) console.log(snapshot);
  }, [snapshot]);

  const handleSpaceKey = useCallback(async () => {
    if (snapshot) {
      // Clear snapshot
      setSnapshot("");
    } else {
      // Take snapshot and stop video
      await stopVideoWithSnapshot();
    }
  }, [snapshot, setSnapshot, stopVideoWithSnapshot]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && (isPlaying || snapshot)) {
        event.preventDefault(); // Prevent page scroll
        handleSpaceKey();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, snapshot, handleSpaceKey]);

  return (
    <div className="app">
      <div
        ref={setVideoEl as Ref<HTMLDivElement> | undefined}
        className="video-container"
      />

      {/* Snapshot Overlay */}
      {snapshot && (
        <div className="snapshot-overlay">
          <div className="snapshot-indicator">Displaying Snapshot Overlay</div>
          <img src={snapshot} alt="Video snapshot" className="snapshot-image" />
        </div>
      )}
    </div>
  );
}

export default App;
