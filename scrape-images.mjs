// Fetch hero images from Wikipedia/Wikimedia for NT properties

const properties = [
  { id: 1, name: "West Wycombe Park", wiki: "West_Wycombe_Park" },
  { id: 2, name: "Peckover House", wiki: "Peckover_House" },
  { id: 3, name: "Trengwainton Garden", wiki: "Trengwainton_Garden" },
  { id: 4, name: "A La Ronde", wiki: "A_la_Ronde" },
  { id: 5, name: "Lydford Gorge", wiki: "Lydford_Gorge" },
  { id: 6, name: "Overbeck's", wiki: "Overbeck%27s" },
  { id: 7, name: "Melford Hall", wiki: "Melford_Hall" },
  { id: 8, name: "Orford Ness", wiki: "Orford_Ness" },
  { id: 9, name: "Hatfield Forest", wiki: "Hatfield_Forest" },
  { id: 10, name: "Chastleton House", wiki: "Chastleton_House" },
  { id: 11, name: "Nuffield Place", wiki: "Nuffield_Place" },
  { id: 12, name: "Runnymede", wiki: "Runnymede" },
  { id: 13, name: "Leith Hill", wiki: "Leith_Hill" },
  { id: 14, name: "Hindhead Common", wiki: "Hindhead" },
  { id: 15, name: "Shaw's Corner", wiki: "Shaw%27s_Corner" },
  { id: 16, name: "Sandham Memorial Chapel", wiki: "Sandham_Memorial_Chapel" },
  { id: 17, name: "Alfriston Clergy House", wiki: "Alfriston_Clergy_House" },
  { id: 18, name: "Lamb House", wiki: "Lamb_House" },
  { id: 19, name: "Woolbeding Gardens", wiki: "Woolbeding" },
  { id: 20, name: "Morden Hall Park", wiki: "Morden_Hall_Park" },
  { id: 21, name: "Carlyle's House", wiki: "Carlyle%27s_House" },
  { id: 22, name: "Sutton House", wiki: "Sutton_House,_Hackney" },
  { id: 23, name: "Penshaw Monument", wiki: "Penshaw_Monument" },
  { id: 24, name: "Hardcastle Crags", wiki: "Hardcastle_Crags" },
  { id: 25, name: "Farne Islands", wiki: "Farne_Islands" },
  { id: 26, name: "Carding Mill Valley", wiki: "Carding_Mill_Valley" },
  { id: 27, name: "Benthall Hall", wiki: "Benthall_Hall" },
  { id: 28, name: "Kinver Edge", wiki: "Kinver_Edge" },
  { id: 29, name: "Clevedon Court", wiki: "Clevedon_Court" },
  { id: 30, name: "Tintinhull Garden", wiki: "Tintinhull_Garden" },
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
