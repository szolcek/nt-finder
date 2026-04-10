const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "Ashdown House National Trust, Lambourn, Berkshire" },
  { id: 2, query: "Buscot Park National Trust, Faringdon, Oxfordshire" },
  { id: 3, query: "Uffington White Horse, Uffington, Oxfordshire" },
  { id: 4, query: "Boscastle National Trust, Boscastle, Cornwall" },
  { id: 5, query: "Kynance Cove National Trust, Lizard, Cornwall" },
  { id: 6, query: "Wheal Coates National Trust, St Agnes, Cornwall" },
  { id: 7, query: "Beatrix Potter Gallery National Trust, Hawkshead, Cumbria" },
  { id: 8, query: "Watersmeet House National Trust, Lynmouth, Devon" },
  { id: 9, query: "Parke Estate National Trust, Bovey Tracey, Devon" },
  { id: 10, query: "Birling Gap National Trust, Eastbourne, East Sussex" },
  { id: 11, query: "South Foreland Lighthouse National Trust, Dover, Kent" },
  { id: 12, query: "Stoneacre National Trust, Otham, Kent" },
  { id: 13, query: "Owletts National Trust, Cobham, Kent" },
  { id: 14, query: "The Needles Old Battery National Trust, Isle of Wight" },
  { id: 15, query: "Bembridge Windmill National Trust, Isle of Wight" },
  { id: 16, query: "George Inn National Trust, Southwark, London" },
  { id: 17, query: "Rainham Hall National Trust, Rainham, London" },
  { id: 18, query: "Blakeney Point National Trust, Norfolk" },
  { id: 19, query: "George Stephenson's Birthplace National Trust, Wylam, Northumberland" },
  { id: 20, query: "Dunstanburgh Castle National Trust, Craster, Northumberland" },
  { id: 21, query: "Allen Banks National Trust, Bardon Mill, Northumberland" },
  { id: 22, query: "Robin Hood's Bay National Trust, Yorkshire" },
  { id: 23, query: "Roseberry Topping, Great Ayton, North Yorkshire" },
  { id: 24, query: "Goddards House and Garden National Trust, York" },
  { id: 25, query: "Mount Grace Priory National Trust, Osmotherley, North Yorkshire" },
  { id: 26, query: "Marsden Moor Estate National Trust, Marsden, West Yorkshire" },
  { id: 27, query: "Bath Assembly Rooms National Trust, Bath, Somerset" },
  { id: 28, query: "Holnicote Estate National Trust, Minehead, Somerset" },
  { id: 29, query: "The Firs Elgar's Birthplace Museum, Lower Broadheath, Worcestershire" },
  { id: 30, query: "The Greyfriars National Trust, Worcester" },
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
