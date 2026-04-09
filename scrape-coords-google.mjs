const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "West Wycombe Park National Trust, High Wycombe, Buckinghamshire" },
  { id: 2, query: "Peckover House National Trust, Wisbech, Cambridgeshire" },
  { id: 3, query: "Trengwainton Garden National Trust, Penzance, Cornwall" },
  { id: 4, query: "A La Ronde National Trust, Exmouth, Devon" },
  { id: 5, query: "Lydford Gorge National Trust, Lydford, Devon" },
  { id: 6, query: "Overbeck's National Trust, Salcombe, Devon" },
  { id: 7, query: "Melford Hall National Trust, Long Melford, Suffolk" },
  { id: 8, query: "Orford Ness National Trust, Orford, Suffolk" },
  { id: 9, query: "Hatfield Forest National Trust, Bishop's Stortford, Essex" },
  { id: 10, query: "Chastleton House National Trust, Chastleton, Oxfordshire" },
  { id: 11, query: "Nuffield Place National Trust, Nuffield, Oxfordshire" },
  { id: 12, query: "Runnymede National Trust, Egham, Surrey" },
  { id: 13, query: "Leith Hill National Trust, Dorking, Surrey" },
  { id: 14, query: "Hindhead Common National Trust, Hindhead, Surrey" },
  { id: 15, query: "Shaw's Corner National Trust, Ayot St Lawrence, Hertfordshire" },
  { id: 16, query: "Sandham Memorial Chapel National Trust, Burghclere, Hampshire" },
  { id: 17, query: "Alfriston Clergy House National Trust, Alfriston, East Sussex" },
  { id: 18, query: "Lamb House National Trust, Rye, East Sussex" },
  { id: 19, query: "Woolbeding Gardens National Trust, Midhurst, West Sussex" },
  { id: 20, query: "Morden Hall Park National Trust, Morden, London" },
  { id: 21, query: "Carlyle's House National Trust, Chelsea, London" },
  { id: 22, query: "Sutton House National Trust, Hackney, London" },
  { id: 23, query: "Penshaw Monument National Trust, Penshaw, Tyne and Wear" },
  { id: 24, query: "Hardcastle Crags National Trust, Hebden Bridge, West Yorkshire" },
  { id: 25, query: "Farne Islands National Trust, Seahouses, Northumberland" },
  { id: 26, query: "Carding Mill Valley National Trust, Church Stretton, Shropshire" },
  { id: 27, query: "Benthall Hall National Trust, Broseley, Shropshire" },
  { id: 28, query: "Kinver Edge National Trust, Kinver, Staffordshire" },
  { id: 29, query: "Clevedon Court National Trust, Clevedon, Somerset" },
  { id: 30, query: "Tintinhull Garden National Trust, Yeovil, Somerset" },
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
