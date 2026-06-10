"use client";

import { use, useRef, useState, useEffect } from "react";

interface Segment {
  type: "music" | "speech" | "noise" | "noEnergy";
  start: number;
  end: number;
}

interface MockData {
  id: string;
  audio_url: string;
  segments: Segment[];
}

const TYPE_LABELS: Record<Segment["type"], string> = {
  music: "Music",
  speech: "Speech",
  noise: "Noise",
  noEnergy: "Silence",
};

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mockData, setMockData] = useState<MockData | null>(null);

  useEffect(() => {
    fetch("/mock/20260510main.json")
      .then((res) => res.json())
      .then((data) => setMockData(data))
      .catch((err) => console.error("Failed to load mock data:", err));
  }, []);
  const handleJump = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch(() => {});
    }
  };

  if (!mockData) {
    return <p>Loading rehearsal data...</p>;
  }

  return (
    <main>
      <header>
        <h1>Segnote</h1>
        <p>
          Recording ID: <strong>{slug}</strong>
        </p>
      </header>

      <section>
        <h2>Audio</h2>
        <audio
          ref={audioRef}
          src="/mock/audio/20260510main.mp3"
          controls
          style={{ width: "100%", maxWidth: "600px" }}
        />
      </section>

      <hr />

      <section>
        <h2>Speech Segmentation</h2>

        <ol>
          {mockData.segments.map((segment, index) => {
            const formatTime = (time: number) => {
              const mins = Math.floor(time / 60);
              const secs = Math.floor(time % 60)
                .toString()
                .padStart(2, "0");
              return `${mins}:${secs}`;
            };

            return (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <article>
                  <h3>{TYPE_LABELS[segment.type] || segment.type}</h3>
                  <p>
                    <time>{formatTime(segment.start)}</time>-<time>{formatTime(segment.end)}</time>（
                    {(segment.end - segment.start).toFixed(1)}s）
                  </p>
                  <button
                    type="button"
                    onClick={() => handleJump(segment.start)}
                  >
                    ▶ Play This
                  </button>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
