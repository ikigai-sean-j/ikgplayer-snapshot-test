import { useEffect, useRef, useState } from "react";
import type { IKGPlayer } from "@ikigaians/ikgplayer";

import "./App.css";
import * as utils from "./streamUtils";

const streamUrl = "https://pull-ws-test.stream.iki-utl.cc/live/sr_hd.flv";

function App() {
  const [player, setPlayer] = useState<IKGPlayer | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<string>("");
  const [playerStatus, setPlayerStatus] = useState<string>(
    "No player initialized"
  );
  const [playerStatusCode, setPlayerStatusCode] = useState<number>(-1);
  const [lastEvent, setLastEvent] = useState<string>("None");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const videoElRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  // RAF loop to continuously check player status
  useEffect(() => {
    const checkStatus = () => {
      if (player) {
        const { status, statusString } = utils.getPlayerStatus(player);
        setPlayerStatus(statusString);
        setPlayerStatusCode(status);
      } else {
        setPlayerStatus("No player initialized");
      }
      rafRef.current = requestAnimationFrame(checkStatus);
    };

    checkStatus();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [player]);

  // Set video element ref
  useEffect(() => {
    if (videoElRef.current) {
      setVideoEl(videoElRef.current);
    }
  }, []);

  const handleInitPlayer = () => {
    if (!videoEl) {
      alert("Video container not available");
      return;
    }

    if (player) {
      alert("Player already initialized. Destroy first.");
      return;
    }

    try {
      const newPlayer = utils.initPlayerInstance(videoEl);
      setPlayer(newPlayer);

      // Register event listeners
      utils.regPlayerListeners(newPlayer, (event) => {
        setLastEvent(`${event} - ${new Date().toLocaleTimeString()}`);
        console.log("Player event:", event);
      });

      console.log("Player initialized successfully");
      setPlayerStatus("Initialized");
    } catch (error) {
      console.error("Error initializing player:", error);
      alert("Failed to initialize player");
    }
  };

  const handleInitAndLoad = async () => {
    if (!videoEl) {
      alert("Video container not available");
      return;
    }

    if (player) {
      alert("Player already initialized. Destroy first.");
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Initialize player
      const newPlayer = utils.initPlayerInstance(videoEl);
      setPlayer(newPlayer);

      // Register event listeners
      utils.regPlayerListeners(newPlayer, (event) => {
        setLastEvent(`${event} - ${new Date().toLocaleTimeString()}`);
        console.log("Player event:", event);
      });

      console.log("Player initialized successfully");

      // Step 2: Load stream
      await utils.load(streamUrl, newPlayer);
      console.log("Stream loaded successfully");

      // Wait for LOADED state (4)
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      while (attempts < maxAttempts) {
        const { status } = utils.getPlayerStatus(newPlayer);
        if (status === 4) {
          // LOADED state
          console.log("Player is now in LOADED state");
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.warn("Timeout waiting for LOADED state");
        alert(
          "Player loaded but didn't reach LOADED state within expected time"
        );
        return;
      }

      // Step 3: Play
      await utils.play(newPlayer);
      console.log("Player started playing");
    } catch (error) {
      console.error("Error in quick start process:", error);
      alert("Failed to complete quick start process");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadPlayer = async () => {
    if (!player) {
      alert("Please initialize player first");
      return;
    }

    try {
      await utils.load(streamUrl, player);
      console.log("Stream loaded successfully");
    } catch (error) {
      console.error("Error loading stream:", error);
      alert("Failed to load stream");
    }
  };

  const handlePlayPlayer = async () => {
    if (!player) {
      alert("Please initialize player first");
      return;
    }

    // Check if player is in LOADED state (4)
    if (playerStatusCode !== 4) {
      alert(
        `Player must be in LOADED state to play. Current state: ${playerStatus}`
      );
      return;
    }

    try {
      await utils.play(player);
      console.log("Player started playing");
    } catch (error) {
      console.error("Error playing stream:", error);
      alert("Failed to play stream");
    }
  };

  const handleStopPlayer = async () => {
    if (!player) {
      alert("Please initialize player first");
      return;
    }

    try {
      await utils.stop(player);
      console.log("Player stopped");
    } catch (error) {
      console.error("Error stopping player:", error);
      alert("Failed to stop player");
    }
  };

  const handleResumePlayer = async () => {
    if (!player) {
      alert("Please initialize player first");
      return;
    }

    try {
      await utils.resume(player);
      console.log("Player resumed");
    } catch (error) {
      console.error("Error resuming player:", error);
      alert("Failed to resume player");
    }
  };

  const handleDestroyPlayer = async () => {
    if (!player) {
      alert("No player to destroy");
      return;
    }

    try {
      await utils.destroy(player);
      setPlayer(null);
      setLastEvent("None");
      console.log("Player destroyed");
    } catch (error) {
      console.error("Error destroying player:", error);
      alert("Failed to destroy player");
    }
  };

  const handleGetSnapshot = () => {
    if (!player) {
      alert("Please initialize player first");
      return;
    }

    try {
      const snapshotData = utils.getSnapshot(player);
      if (snapshotData) {
        setSnapshot(snapshotData);
        console.log("Snapshot taken successfully");
        console.log(snapshotData);
      } else {
        alert("Failed to get snapshot");
      }
    } catch (error) {
      console.error("Error taking snapshot:", error);
      alert("Failed to take snapshot");
    }
  };

  const clearSnapshot = () => {
    setSnapshot("");
  };

  return (
    <div className="app">
      {/* Control Panel */}
      <div
        className="control-panel"
        style={{
          padding: "20px",
          backgroundColor: "#f5f5f5",
          marginBottom: "20px",
        }}
      >
        <h2>IKG Player Test Interface</h2>

        {/* Status Display */}
        <div style={{ marginBottom: "15px" }}>
          <p>
            <strong>Player Status:</strong> {playerStatus}{" "}
            {isProcessing && "(Processing...)"}
          </p>
          <p>
            <strong>Last Event:</strong> {lastEvent}
          </p>
          <p>
            <strong>Stream URL:</strong> {streamUrl}
          </p>
        </div>

        {/* Control Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={handleInitPlayer}
            disabled={player !== null || isProcessing}
          >
            1. Init Player
          </button>
          <button
            onClick={handleLoadPlayer}
            disabled={player === null || isProcessing}
          >
            2. Load Stream
          </button>
          <button
            onClick={handlePlayPlayer}
            disabled={player === null || playerStatusCode !== 4 || isProcessing}
          >
            3. Play
          </button>
          <button
            onClick={handleStopPlayer}
            disabled={player === null || isProcessing}
          >
            4. Stop
          </button>
          <button
            onClick={handleDestroyPlayer}
            disabled={player === null || isProcessing}
          >
            5. Destroy
          </button>
          <button
            onClick={handleInitAndLoad}
            disabled={player !== null || isProcessing}
            className="quick-start-button"
          >
            🚀 Quick Start (1-3)
          </button>
          <button
            onClick={handleResumePlayer}
            disabled={player === null || playerStatusCode <= 4 || isProcessing}
          >
            Resume
          </button>
          <button
            onClick={handleGetSnapshot}
            disabled={player === null || isProcessing}
          >
            Get Snapshot
          </button>
          {snapshot && (
            <button onClick={clearSnapshot} disabled={isProcessing}>
              Clear Snapshot
            </button>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div
        ref={videoElRef}
        className="video-container"
        style={{ minHeight: "400px", backgroundColor: "#000" }}
      />

      {/* Snapshot Overlay */}
      {snapshot && (
        <div className="snapshot-overlay">
          <button className="snapshot-close-button" onClick={clearSnapshot}>
            ✕
          </button>
          <div className="snapshot-indicator">Displaying Snapshot Overlay</div>
          <img src={snapshot} alt="Video snapshot" className="snapshot-image" />
        </div>
      )}
    </div>
  );
}

export default App;
