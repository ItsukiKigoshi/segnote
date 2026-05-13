export type Seg = {
  start: number;
  end: number;
  type: "music" | "speech" | "other";
};
export type Rec = {
  id: string;
  audio_url: string;
  segments: Seg[];
};
