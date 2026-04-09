const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 893, query: "Hughenden Manor National Trust, High Wycombe" },
  { id: 894, query: "Ashridge Estate National Trust, Berkhamsted" },
  { id: 895, query: "Ascott House National Trust, Wing, Buckinghamshire" },
  { id: 896, query: "Snowshill Manor National Trust, Broadway, Gloucestershire" },
  { id: 897, query: "Compton Castle National Trust, Paignton, Devon" },
  { id: 898, query: "Sutton Hoo National Trust, Woodbridge, Suffolk" },
  { id: 899, query: "Antony House National Trust, Torpoint, Cornwall" },
  { id: 900, query: "St Michael's Mount National Trust, Marazion, Cornwall" },
  { id: 901, query: "Formby National Trust, Formby, Merseyside" },
  { id: 902, query: "Dunwich Heath National Trust, Saxmundham, Suffolk" },
];

for (const place of places) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place.query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.results && data.results.length > 0) {
    const loc = data.results[0].geometry.location;
    console.log(`${place.id} | ${place.query.split(',')[0]} | ${loc.lat}, ${loc.lng}`);
  } else {
    console.log(`${place.id} | ${place.query.split(',')[0]} | NOT FOUND`);
  }
}
