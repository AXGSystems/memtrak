// ALTA brand colors used across all dashboard charts
export const COLORS = {
  navy: '#1B3A5C',
  navyDark: '#122840',
  navyLight: '#2a5580',
  green: '#8CC63F',
  greenDark: '#6fa030',
  blue: '#4A90D9',
  blueDark: '#2a6bb0',
  orange: '#E8923F',
  red: '#D94A4A',
};

// All 50 US state capitals + DC with coordinates
export const STATE_CAPITALS: { abbr: string; name: string; lat: number; lng: number }[] = [
  { abbr: 'AL', name: 'Alabama', lat: 32.377, lng: -86.300 },
  { abbr: 'AK', name: 'Alaska', lat: 58.302, lng: -134.420 },
  { abbr: 'AZ', name: 'Arizona', lat: 33.449, lng: -112.074 },
  { abbr: 'AR', name: 'Arkansas', lat: 34.747, lng: -92.290 },
  { abbr: 'CA', name: 'California', lat: 38.576, lng: -121.494 },
  { abbr: 'CO', name: 'Colorado', lat: 39.739, lng: -104.985 },
  { abbr: 'CT', name: 'Connecticut', lat: 41.764, lng: -72.682 },
  { abbr: 'DE', name: 'Delaware', lat: 39.158, lng: -75.524 },
  { abbr: 'DC', name: 'District of Columbia', lat: 38.907, lng: -77.037 },
  { abbr: 'FL', name: 'Florida', lat: 30.438, lng: -84.281 },
  { abbr: 'GA', name: 'Georgia', lat: 33.749, lng: -84.388 },
  { abbr: 'HI', name: 'Hawaii', lat: 21.307, lng: -157.857 },
  { abbr: 'ID', name: 'Idaho', lat: 43.615, lng: -116.202 },
  { abbr: 'IL', name: 'Illinois', lat: 39.799, lng: -89.644 },
  { abbr: 'IN', name: 'Indiana', lat: 39.768, lng: -86.158 },
  { abbr: 'IA', name: 'Iowa', lat: 41.591, lng: -93.604 },
  { abbr: 'KS', name: 'Kansas', lat: 39.048, lng: -95.678 },
  { abbr: 'KY', name: 'Kentucky', lat: 38.187, lng: -84.875 },
  { abbr: 'LA', name: 'Louisiana', lat: 30.451, lng: -91.187 },
  { abbr: 'ME', name: 'Maine', lat: 44.307, lng: -69.782 },
  { abbr: 'MD', name: 'Maryland', lat: 38.979, lng: -76.491 },
  { abbr: 'MA', name: 'Massachusetts', lat: 42.358, lng: -71.064 },
  { abbr: 'MI', name: 'Michigan', lat: 42.733, lng: -84.555 },
  { abbr: 'MN', name: 'Minnesota', lat: 44.955, lng: -93.102 },
  { abbr: 'MS', name: 'Mississippi', lat: 32.303, lng: -90.182 },
  { abbr: 'MO', name: 'Missouri', lat: 38.579, lng: -92.173 },
  { abbr: 'MT', name: 'Montana', lat: 46.586, lng: -112.018 },
  { abbr: 'NE', name: 'Nebraska', lat: 40.808, lng: -96.700 },
  { abbr: 'NV', name: 'Nevada', lat: 39.164, lng: -119.766 },
  { abbr: 'NH', name: 'New Hampshire', lat: 43.207, lng: -71.538 },
  { abbr: 'NJ', name: 'New Jersey', lat: 40.221, lng: -74.756 },
  { abbr: 'NM', name: 'New Mexico', lat: 35.682, lng: -105.940 },
  { abbr: 'NY', name: 'New York', lat: 42.653, lng: -73.758 },
  { abbr: 'NC', name: 'North Carolina', lat: 35.780, lng: -78.639 },
  { abbr: 'ND', name: 'North Dakota', lat: 46.820, lng: -100.783 },
  { abbr: 'OH', name: 'Ohio', lat: 39.962, lng: -82.999 },
  { abbr: 'OK', name: 'Oklahoma', lat: 35.493, lng: -97.451 },
  { abbr: 'OR', name: 'Oregon', lat: 44.938, lng: -123.030 },
  { abbr: 'PA', name: 'Pennsylvania', lat: 40.264, lng: -76.884 },
  { abbr: 'RI', name: 'Rhode Island', lat: 41.824, lng: -71.413 },
  { abbr: 'SC', name: 'South Carolina', lat: 34.000, lng: -81.035 },
  { abbr: 'SD', name: 'South Dakota', lat: 44.368, lng: -100.336 },
  { abbr: 'TN', name: 'Tennessee', lat: 36.166, lng: -86.784 },
  { abbr: 'TX', name: 'Texas', lat: 30.275, lng: -97.740 },
  { abbr: 'UT', name: 'Utah', lat: 40.777, lng: -111.888 },
  { abbr: 'VT', name: 'Vermont', lat: 44.260, lng: -72.576 },
  { abbr: 'VA', name: 'Virginia', lat: 37.539, lng: -77.434 },
  { abbr: 'WA', name: 'Washington', lat: 47.043, lng: -122.893 },
  { abbr: 'WV', name: 'West Virginia', lat: 38.350, lng: -81.633 },
  { abbr: 'WI', name: 'Wisconsin', lat: 43.075, lng: -89.384 },
  { abbr: 'WY', name: 'Wyoming', lat: 41.140, lng: -104.820 },
];

// Lookup helpers
export const STATE_NAMES: Record<string, string> = Object.fromEntries(
  STATE_CAPITALS.map(s => [s.abbr, s.name])
);

export const STATE_COORDS: Record<string, [number, number]> = Object.fromEntries(
  STATE_CAPITALS.map(s => [s.abbr, [s.lat, s.lng]])
);
