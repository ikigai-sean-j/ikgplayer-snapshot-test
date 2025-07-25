import { useEffect, useState, type Ref } from "react";

import "./App.css";
import useStream from "./useStream";

function App() {
  const { setVideoEl, snapshot, isPlaying } = useStream();

  useEffect(() => {
    if (!isPlaying) return;
    console.log("Video is playing");
  }, [isPlaying]);

  return (
    <div className="app">
      <div
        ref={setVideoEl as Ref<HTMLDivElement> | undefined}
        className="video-container"
      ></div>
    </div>
  );
}

export default App;
