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

interface GroupedSegment {
  type: "music" | "other";
  start: number;
  end: number;
}

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

  const groupedSegments: GroupedSegment[] = [];
  mockData.segments.forEach((segment) => {
    const currentType = segment.type === "music" ? "music" : "other";
    const lastGroup = groupedSegments[groupedSegments.length - 1];

    if (lastGroup && lastGroup.type === currentType) {
      lastGroup.end = segment.end;
    } else {
      groupedSegments.push({
        type: currentType,
        start: segment.start,
        end: segment.end,
      });
    }
  });

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
        <h2>Timeline Blocks</h2>
        <ol>
          {groupedSegments.map((group, index) => {
            const formatTime = (time: number) => {
              const mins = Math.floor(time / 60);
              const secs = Math.floor(time % 60)
                .toString()
                .padStart(2, "0");
              return `${mins}:${secs}`;
            };

            return (
              <li key={index} style={{ marginBottom: "1.5rem" }}>
                <article>
                  <h3>
                    {group.type === "music" ? "Music Section" : "Other Section"}
                  </h3>
                  <p>
                    <time>{formatTime(group.start)}</time> -{" "}
                    <time>{formatTime(group.end)}</time> (
                    {(group.end - group.start).toFixed(1)}s)
                  </p>
                  <button type="button" onClick={() => handleJump(group.start)}>
                    ▶ Play Block
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
