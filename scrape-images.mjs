// Fetch hero images from Wikipedia/Wikimedia for NT properties

const properties = [
  { id: 1, name: "Hughenden Manor", wiki: "Hughenden_Manor" },
  { id: 2, name: "Ashridge Estate", wiki: "Ashridge" },
  { id: 3, name: "Ascott House", wiki: "Ascott_House" },
  { id: 4, name: "St Michael's Mount", wiki: "St_Michael%27s_Mount" },
  { id: 5, name: "Compton Castle", wiki: "Compton_Castle" },
  { id: 6, name: "Tintagel Old Post Office", wiki: "Tintagel_Old_Post_Office" },
  { id: 7, name: "Finch Foundry", wiki: "Finch_Foundry" },
  { id: 8, name: "Snowshill Manor", wiki: "Snowshill_Manor" },
  { id: 9, name: "Westbury Court Garden", wiki: "Westbury_Court_Garden" },
  { id: 10, name: "Smallhythe Place", wiki: "Smallhythe_Place" },
  { id: 11, name: "South Foreland Lighthouse", wiki: "South_Foreland_Lighthouse" },
  { id: 12, name: "Quebec House", wiki: "Quebec_House" },
  { id: 13, name: "Formby", wiki: "Formby_coast" },
  { id: 14, name: "Horsey Windpump", wiki: "Horsey_Wind_Pump" },
  { id: 15, name: "Sutton Hoo", wiki: "Sutton_Hoo" },
  { id: 16, name: "Barrington Court", wiki: "Barrington_Court" },
  { id: 17, name: "Coleridge Cottage", wiki: "Coleridge_Cottage" },
  { id: 18, name: "Dunster Working Watermill", wiki: "Dunster_Castle" },
  { id: 19, name: "Stoneywell", wiki: "Stoneywell" },
  { id: 20, name: "Moseley Old Hall", wiki: "Moseley_Old_Hall" },
  { id: 21, name: "Great Chalfield Manor", wiki: "Great_Chalfield_Manor" },
  { id: 22, name: "The Courts Garden", wiki: "The_Courts_Garden" },
  { id: 23, name: "Westwood Manor", wiki: "Westwood_Manor" },
  { id: 24, name: "Farnborough Hall", wiki: "Farnborough_Hall" },
  { id: 25, name: "Dudmaston Hall", wiki: "Dudmaston" },
  { id: 26, name: "Wilderhope Manor", wiki: "Wilderhope_Manor" },
  { id: 27, name: "Sunnycroft", wiki: "Sunnycroft" },
  { id: 28, name: "Treasurer's House", wiki: "Treasurer%27s_House,_York" },
  { id: 29, name: "Ormesby Hall", wiki: "Ormesby_Hall" },
  { id: 30, name: "The Workhouse, Southwell", wiki: "The_Workhouse,_Southwell" },
];

for (const prop of properties) {
  try {
    // Use Wikipedia API to get the main image (pageimages)
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${prop.wiki}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.originalimage?.source) {
      console.log(`${prop.id} | ${prop.name} | ${data.originalimage.source}`);
    } else if (data.thumbnail?.source) {
      // Get original size from thumbnail URL
      const orig = data.thumbnail.source.replace(/\/\d+px-/, '/1024px-');
      console.log(`${prop.id} | ${prop.name} | ${orig} (from thumbnail)`);
    } else {
      console.log(`${prop.id} | ${prop.name} | NO IMAGE`);
    }
  } catch (e) {
    console.log(`${prop.id} | ${prop.name} | ERROR: ${e.message}`);
  }
}
