// Fetch hero images from Wikipedia/Wikimedia for NT properties

const properties = [
  { id: 893, name: "Hughenden Manor", wiki: "Hughenden_Manor" },
  { id: 894, name: "Ashridge Estate", wiki: "Ashridge" },
  { id: 895, name: "Ascott House", wiki: "Ascott_House" },
  { id: 896, name: "Snowshill Manor", wiki: "Snowshill_Manor" },
  { id: 897, name: "Compton Castle", wiki: "Compton_Castle" },
  { id: 898, name: "Sutton Hoo", wiki: "Sutton_Hoo" },
  { id: 899, name: "Antony House", wiki: "Antony_House" },
  { id: 900, name: "St Michael's Mount", wiki: "St_Michael%27s_Mount" },
  { id: 901, name: "Formby", wiki: "Formby_coast" },
  { id: 902, name: "Dunwich Heath", wiki: "Dunwich_Heath" },
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
