/**
 * Places organisers have used for public events on Eventra. In the live
 * system this directory grows each time an organiser attaches a location to a
 * public event (private homes are never added). Prices and contacts stay with
 * the organiser who entered them; only these facts are shared.
 */
export interface KnownPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area: string;
  eventsHosted: number;
  eventTypes: string[];
  largestCheckIn?: number;
  onGoogle: boolean;
  directions?: string;
}

export const knownPlaces: KnownPlace[] = [
  { id: "kp1", name: "Heroes National Stadium", lat: -15.3647, lng: 28.3667, area: "Lusaka", eventsHosted: 14, eventTypes: ["Concert", "Sports", "Church"], largestCheckIn: 41_200, onGoogle: true, directions: "Enter from Great East Road; VIP parking at Gate 4." },
  { id: "kp2", name: "Mulungushi International Conference Centre", lat: -15.3897, lng: 28.3301, area: "Lusaka", eventsHosted: 9, eventTypes: ["Conference", "Exhibition"], largestCheckIn: 1_850, onGoogle: true },
  { id: "kp3", name: "Levy Park Amphitheatre", lat: -15.4093, lng: 28.2871, area: "Lusaka", eventsHosted: 6, eventTypes: ["Concert", "Comedy"], largestCheckIn: 2_310, onGoogle: true },
  { id: "kp4", name: "Kabulonga Gardens (Mwaba's)", lat: -15.4282, lng: 28.3363, area: "Lusaka", eventsHosted: 5, eventTypes: ["Wedding", "Kitchen party"], largestCheckIn: 320, onGoogle: false, directions: "Off Kabulonga Road, opposite the Total filling station. Green gate with balloons on event days." },
  { id: "kp5", name: "Chelstone Community Hall", lat: -15.3612, lng: 28.3896, area: "Lusaka", eventsHosted: 3, eventTypes: ["Church", "Kitchen party", "Training"], largestCheckIn: 180, onGoogle: false, directions: "Behind Chelstone Market, next to the clinic." },
  { id: "kp6", name: "Garden Court Kitwe Ballroom", lat: -12.8024, lng: 28.2132, area: "Kitwe", eventsHosted: 4, eventTypes: ["Wedding", "Conference"], largestCheckIn: 640, onGoogle: true },
  { id: "kp7", name: "Victoria Falls Riverside Lawn", lat: -17.8591, lng: 25.8566, area: "Livingstone", eventsHosted: 2, eventTypes: ["Wedding", "Corporate"], largestCheckIn: 410, onGoogle: true },
];

/** A short link the sample "server" can open, so the preview shows the full flow. */
export const sampleShortLinks: Record<string, { lat: number; lng: number; name: string; placeId: string }> = {
  default: { lat: -15.4093, lng: 28.2871, name: "Levy Park Amphitheatre", placeId: "ChIJsampleLevyPark" },
};
