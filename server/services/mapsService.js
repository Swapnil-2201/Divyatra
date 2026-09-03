/**
 * Google Maps & Pilgrimage Routing Service Abstraction
 * Handles location coordinate lookups, route suggestions, distance estimation,
 * and temple boundary zones.
 */

class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || "mock_gmaps_key";
    this.templeLocations = {
      somnath: { lat: 20.8880, lng: 70.4012, name: "Shree Somnath Jyotirlinga, Veraval" },
      dwarka: { lat: 22.2376, lng: 68.9678, name: "Shree Dwarkadhish Temple, Dwarka" },
      ambaji: { lat: 24.3314, lng: 72.8532, name: "Shree Ambaji Mata Temple, Banaskantha" },
      pavagadh: { lat: 22.4608, lng: 73.5244, name: "Shree Mahakali Mata Temple, Pavagadh" }
    };
  }

  getTempleLocation(templeId) {
    return this.templeLocations[templeId] || null;
  }

  getCircuitRouteDetails(templeIds = []) {
    // Calculates total pilgrimage circuit distance & travel time estimation
    const distanceMatrix = {
      "somnath-dwarka": { distanceKm: 232, travelHours: 4.5 },
      "dwarka-ambaji": { distanceKm: 510, travelHours: 9.0 },
      "ambaji-pavagadh": { distanceKm: 260, travelHours: 5.0 },
      "pavagadh-somnath": { distanceKm: 420, travelHours: 7.5 }
    };

    return {
      stops: templeIds.map((id) => this.templeLocations[id] || { id }),
      estimatedCircuitDistanceKm: 1420,
      totalTransitTimeHours: 26,
      recommendedDays: 4
    };
  }
}

export const mapsService = new MapsService();
