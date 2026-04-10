const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const places = [
  { id: 1, query: "Hughenden Manor National Trust, High Wycombe, Buckinghamshire" },
  { id: 2, query: "Ashridge Estate National Trust, Berkhamsted, Hertfordshire" },
  { id: 3, query: "Ascott House National Trust, Wing, Buckinghamshire" },
  { id: 4, query: "St Michael's Mount National Trust, Marazion, Cornwall" },
  { id: 5, query: "Compton Castle National Trust, Compton, Devon" },
  { id: 6, query: "Tintagel Old Post Office National Trust, Tintagel, Cornwall" },
  { id: 7, query: "Finch Foundry National Trust, Sticklepath, Devon" },
  { id: 8, query: "Snowshill Manor National Trust, Snowshill, Gloucestershire" },
  { id: 9, query: "Westbury Court Garden National Trust, Westbury-on-Severn, Gloucestershire" },
  { id: 10, query: "Smallhythe Place National Trust, Smallhythe, Kent" },
  { id: 11, query: "South Foreland Lighthouse National Trust, St Margaret's Bay, Kent" },
  { id: 12, query: "Quebec House National Trust, Westerham, Kent" },
  { id: 13, query: "Formby National Trust, Formby, Merseyside" },
  { id: 14, query: "Horsey Windpump National Trust, Horsey, Norfolk" },
  { id: 15, query: "Sutton Hoo National Trust, Woodbridge, Suffolk" },
  { id: 16, query: "Barrington Court National Trust, Barrington, Somerset" },
  { id: 17, query: "Coleridge Cottage National Trust, Nether Stowey, Somerset" },
  { id: 18, query: "Dunster Working Watermill National Trust, Dunster, Somerset" },
  { id: 19, query: "Stoneywell National Trust, Ulverscroft, Leicestershire" },
  { id: 20, query: "Moseley Old Hall National Trust, Fordhouses, Staffordshire" },
  { id: 21, query: "Great Chalfield Manor National Trust, Broughton Gifford, Wiltshire" },
  { id: 22, query: "The Courts Garden National Trust, Holt, Wiltshire" },
  { id: 23, query: "Westwood Manor National Trust, Bradford-on-Avon, Wiltshire" },
  { id: 24, query: "Farnborough Hall National Trust, Farnborough, Warwickshire" },
  { id: 25, query: "Dudmaston Hall National Trust, Quatt, Shropshire" },
  { id: 26, query: "Wilderhope Manor National Trust, Longville in the Dale, Shropshire" },
  { id: 27, query: "Sunnycroft National Trust, Wellington, Shropshire" },
  { id: 28, query: "Treasurer's House National Trust, York, Yorkshire" },
  { id: 29, query: "Ormesby Hall National Trust, Ormesby, Middlesbrough" },
  { id: 30, query: "The Workhouse National Trust, Southwell, Nottinghamshire" },
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
