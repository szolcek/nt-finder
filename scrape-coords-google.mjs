const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "Blaise Hamlet National Trust, Henbury, Bristol" },
  { id: 2, query: "Coombe Hill National Trust, Wendover, Buckinghamshire" },
  { id: 3, query: "Carnewas Bedruthan Steps National Trust, Cornwall" },
  { id: 4, query: "St Anthony Head National Trust, Roseland, Cornwall" },
  { id: 5, query: "Penrose Estate National Trust, Helston, Cornwall" },
  { id: 6, query: "Derwent Island House National Trust, Keswick, Cumbria" },
  { id: 7, query: "Shute Barton National Trust, Shute, Devon" },
  { id: 8, query: "Ballard Down National Trust, Swanage, Dorset" },
  { id: 9, query: "Bourne Mill National Trust, Colchester, Essex" },
  { id: 10, query: "Woodchester Park National Trust, Nympsfield, Gloucestershire" },
  { id: 11, query: "Horton Court National Trust, Horton, Gloucestershire" },
  { id: 12, query: "Lodge Park Sherborne Estate National Trust, Cheltenham, Gloucestershire" },
  { id: 13, query: "West Green House Garden National Trust, Hartley Wintney, Hampshire" },
  { id: 14, query: "The Weir Garden National Trust, Swainshill, Herefordshire" },
  { id: 15, query: "Mottistone Gardens National Trust, Isle of Wight" },
  { id: 16, query: "Coldrum Long Barrow National Trust, Trottiscliffe, Kent" },
  { id: 17, query: "Toys Hill National Trust, Westerham, Kent" },
  { id: 18, query: "Staunton Harold Church National Trust, Ashby-de-la-Zouch, Leicestershire" },
  { id: 19, query: "575 Wandsworth Road National Trust, London" },
  { id: 20, query: "Eastbury Manor House National Trust, Barking, London" },
  { id: 21, query: "Brancaster Estate National Trust, Norfolk" },
  { id: 22, query: "Hadrian's Wall Housesteads Fort National Trust, Northumberland" },
  { id: 23, query: "Cronkhill National Trust, Attingham, Shropshire" },
  { id: 24, query: "Fyne Court National Trust, Broomfield, Somerset" },
  { id: 25, query: "King Alfred's Tower National Trust, Stourton, Somerset" },
  { id: 26, query: "Cheddar Gorge National Trust, Somerset" },
  { id: 27, query: "Avebury Manor National Trust, Avebury, Wiltshire" },
  { id: 28, query: "Stonehenge Landscape National Trust, Wiltshire" },
  { id: 29, query: "The Fleece Inn National Trust, Bretforton, Worcestershire" },
  { id: 30, query: "Wentworth Castle Gardens National Trust, Barnsley, South Yorkshire" },
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
