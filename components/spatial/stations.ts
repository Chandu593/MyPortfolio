export const stations = [
  { id: "origin", name: "Origin", label: "THE OBSERVATORY", color: "#a6f5e8", dayColor: "#155e56", position: [0, 0, 0], angle: 0, description: "Chandra Sekhar Reddy · AI/ML Engineer & Researcher" },
  { id: "work", name: "Work", label: "THE PROJECT ARCHIVE", color: "#a9bbff", dayColor: "#3d4c8c", position: [-16, 3, -32], angle: .18, description: "Four ideas. Four working systems." },
  { id: "research", name: "Research", label: "THE RESEARCH CHAMBER", color: "#ffcc8d", dayColor: "#785010", position: [16, 8, -64], angle: -.18, description: "Fed-THOR · Healthcare AI" },
  { id: "expertise", name: "Expertise", label: "THE KNOWLEDGE CONSTELLATION", color: "#d8afff", dayColor: "#67408c", position: [-13, 2, -98], angle: .16, description: "Research depth. Engineering range." },
  { id: "journey", name: "Journey", label: "THE MEMORY VAULT", color: "#97d4ff", dayColor: "#255b81", position: [13, -3, -131], angle: -.12, description: "Education, experience, and what comes next." },
  { id: "contact", name: "Connect", label: "THE SIGNAL ROOM", color: "#c8ee9f", dayColor: "#40621b", position: [0, 4, -166], angle: 0, description: "A new connection starts here." },
] as const;
export type StationId = (typeof stations)[number]["id"];
export type StationSlots = Record<StationId, HTMLDivElement>;
export type Exhibit = "project" | "skill" | "research";
export interface WorldController {
  goTo: (index: number, immediate?: boolean) => void;
  pause: (paused: boolean) => void;
  signal: () => void;
  explode: (value: boolean) => void;
  theme: (light: boolean) => void;
  select: (type: Exhibit, index: number) => void;
  dispose: () => void;
}
export interface WorldCallbacks {
  onReady: (slots: StationSlots) => void;
  onProgress: (value: number) => void;
  onSelect: (type: Exhibit, index: number) => void;
  onNavigate: (direction: number) => void;
  onError: () => void;
}
