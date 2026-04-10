const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "Dunstable Downs National Trust, Dunstable, Bedfordshire" },
  { id: 2, query: "Botallack Mine National Trust, St Just, Cornwall" },
  { id: 3, query: "Godrevy National Trust, Hayle, Cornwall" },
  { id: 4, query: "Sandymouth Beach National Trust, Bude, Cornwall" },
  { id: 5, query: "Crook Hall and Gardens National Trust, Durham" },
  { id: 6, query: "Stainsby Mill National Trust, Doe Lea, Derbyshire" },
  { id: 7, query: "Baggy Point National Trust, Croyde, Devon" },
  { id: 8, query: "Heddon Valley National Trust, Parracombe, Devon" },
  { id: 9, query: "Old Harry Rocks, Swanage, Dorset" },
  { id: 10, query: "Coggeshall Grange Barn National Trust, Coggeshall, Essex" },
  { id: 11, query: "Danbury Common National Trust, Danbury, Essex" },
  { id: 12, query: "Ashleworth Tithe Barn National Trust, Ashleworth, Gloucestershire" },
  { id: 13, query: "Haresfield Beacon National Trust, Standish, Gloucestershire" },
  { id: 14, query: "Bembridge Fort National Trust, Bembridge, Isle of Wight" },
  { id: 15, query: "Chiddingstone National Trust, Kent" },
  { id: 16, query: "Old Soar Manor National Trust, Plaxtol, Kent" },
  { id: 17, query: "Heysham Head National Trust, Heysham, Lancashire" },
  { id: 18, query: "Grantham House National Trust, Grantham, Lincolnshire" },
  { id: 19, query: "Blewcoat School National Trust, Westminster, London" },
  { id: 20, query: "Mow Cop Castle National Trust, Stoke-on-Trent, Staffordshire" },
  { id: 21, query: "Cissbury Ring National Trust, Worthing, West Sussex" },
  { id: 22, query: "Devil's Dyke National Trust, Brighton, West Sussex" },
  { id: 23, query: "Bredon Barn National Trust, Bredon, Worcestershire" },
  { id: 24, query: "Hawford Dovecote National Trust, Hawford, Worcestershire" },
  { id: 25, query: "Malham Tarn National Trust, Malham, North Yorkshire" },
  { id: 26, query: "Upper Wharfedale National Trust, Buckden, North Yorkshire" },
  { id: 27, query: "Conwy Suspension Bridge National Trust, Conwy, Wales" },
  { id: 28, query: "Skenfrith Castle National Trust, Skenfrith, Monmouthshire" },
  { id: 29, query: "Rhossili Bay National Trust, Gower, Swansea" },
  { id: 30, query: "Cilgerran Castle National Trust, Cilgerran, Pembrokeshire" },
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
