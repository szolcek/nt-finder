const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "Sharpenhoe Clappers National Trust, Sharpenhoe, Bedfordshire" },
  { id: 2, query: "Whipsnade Tree Cathedral National Trust, Whipsnade, Bedfordshire" },
  { id: 3, query: "Willington Dovecote National Trust, Willington, Bedfordshire" },
  { id: 4, query: "Great Coxwell Barn National Trust, Great Coxwell, Oxfordshire" },
  { id: 5, query: "Boarstall Duck Decoy National Trust, Boarstall, Buckinghamshire" },
  { id: 6, query: "Boarstall Tower National Trust, Boarstall, Buckinghamshire" },
  { id: 7, query: "Buckingham Chantry Chapel National Trust, Buckingham" },
  { id: 8, query: "Dorneywood Garden National Trust, Burnham, Buckinghamshire" },
  { id: 9, query: "Long Crendon Courthouse National Trust, Long Crendon, Buckinghamshire" },
  { id: 10, query: "Pitstone Windmill National Trust, Pitstone, Buckinghamshire" },
  { id: 11, query: "Ramsey Abbey Gatehouse National Trust, Ramsey, Cambridgeshire" },
  { id: 12, query: "Cadsonbury National Trust, Callington, Cornwall" },
  { id: 13, query: "Lawrence House National Trust, Launceston, Cornwall" },
  { id: 14, query: "Duffield Castle National Trust, Duffield, Derbyshire" },
  { id: 15, query: "The Old Manor National Trust, Norbury, Derbyshire" },
  { id: 16, query: "Winster Market House National Trust, Winster, Derbyshire" },
  { id: 17, query: "Bolberry Down National Trust, Salcombe, Devon" },
  { id: 18, query: "Branscombe National Trust, Branscombe, Devon" },
  { id: 19, query: "Loughwood Meeting House National Trust, Dalwood, Devon" },
  { id: 20, query: "Plymbridge Woods National Trust, Plymouth, Devon" },
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
