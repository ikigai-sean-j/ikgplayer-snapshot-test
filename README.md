# Steps to reproduce distorted snapshot issue

1. Run `npm install`.
2. Start the development server with `npm run dev`.
3. Open [http://localhost:5173/](http://localhost:5173/) in **Firefox**.
4. Open the developer tools and set the viewport width to an resolution cannot be divided by 4, such as 1401 × 700.
5. Press the **spacebar** to take a snapshot and pause the video. Observe the snapshot result on the screen.
6. Press the **spacebar** again to resume playback.

## Demo Video

<video controls width="600">
  <source src="./firefox-video-snapshot-issue.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
