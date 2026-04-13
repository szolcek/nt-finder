const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "St John's Jerusalem National Trust, Sutton at Hone, Kent" },
  { id: 2, query: "Darrow Wood National Trust, Blickling, Norfolk" },
  { id: 3, query: "St George's Guildhall National Trust, King's Lynn, Norfolk" },
  { id: 4, query: "Brean Down National Trust, Brean, Somerset" },
  { id: 5, query: "Wellington Monument National Trust, Wellington, Somerset" },
  { id: 6, query: "King John's Hunting Lodge National Trust, Axbridge, Somerset" },
  { id: 7, query: "Leigh Woods National Trust, Bristol" },
  { id: 8, query: "Stoke sub Hamdon Priory National Trust, Stoke sub Hamdon, Somerset" },
  { id: 9, query: "Stembridge Tower Mill National Trust, High Ham, Somerset" },
  { id: 10, query: "Cadbury Camp National Trust, Tickenham, Somerset" },
  { id: 11, query: "Downs Banks National Trust, Barlaston, Staffordshire" },
  { id: 12, query: "Knowles Mill National Trust, Bewdley, Worcestershire" },
  { id: 13, query: "Middle Littleton Tithe Barn National Trust, Middle Littleton, Worcestershire" },
  { id: 14, query: "Rosedene National Trust, Dodford, Worcestershire" },
  { id: 15, query: "Wichenford Dovecote National Trust, Wichenford, Worcestershire" },
  { id: 16, query: "Maister House National Trust, Hull, East Yorkshire" },
  { id: 17, query: "Braithwaite Hall National Trust, Middleham, North Yorkshire" },
  { id: 18, query: "Bridestones National Trust, Dalby Forest, North Yorkshire" },
  { id: 19, query: "Yorkshire Coast National Trust, Robin Hood's Bay, North Yorkshire" },
  { id: 20, query: "Bookham Commons National Trust, Great Bookham, Surrey" },
  { id: 21, query: "Clandon Park National Trust, West Clandon, Surrey" },
  { id: 22, query: "River Wey Navigations National Trust, Godalming, Surrey" },
  { id: 23, query: "Reigate Hill National Trust, Reigate, Surrey" },
  { id: 24, query: "Harting Down National Trust, South Harting, West Sussex" },
  { id: 25, query: "Kinwarton Dovecote National Trust, Kinwarton, Warwickshire" },
  { id: 26, query: "The Roundhouse National Trust, Birmingham" },
  { id: 27, query: "Cley Hill National Trust, Warminster, Wiltshire" },
  { id: 28, query: "Figsbury Ring National Trust, Salisbury, Wiltshire" },
  { id: 29, query: "Pepperbox Hill National Trust, Salisbury, Wiltshire" },
  { id: 30, query: "Wakehurst Place National Trust, Ardingly, West Sussex" },
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
