// Fetch hero images from Wikipedia/Wikimedia for NT properties

const properties = [
  { id: 1, name: "Ashdown House", wiki: "Ashdown_House,_Oxfordshire" },
  { id: 2, name: "Buscot Park", wiki: "Buscot_Park" },
  { id: 3, name: "Uffington White Horse", wiki: "Uffington_White_Horse" },
  { id: 4, name: "Boscastle", wiki: "Boscastle" },
  { id: 5, name: "Kynance Cove", wiki: "Kynance_Cove" },
  { id: 6, name: "Wheal Coates", wiki: "Wheal_Coates" },
  { id: 7, name: "Beatrix Potter Gallery", wiki: "Beatrix_Potter_Gallery" },
  { id: 8, name: "Watersmeet", wiki: "Watersmeet" },
  { id: 9, name: "Parke", wiki: "Parke_(estate)" },
  { id: 10, name: "Birling Gap", wiki: "Birling_Gap" },
  { id: 11, name: "South Foreland Lighthouse", wiki: "South_Foreland_Lighthouse" },
  { id: 12, name: "Stoneacre", wiki: "Stoneacre" },
  { id: 13, name: "Owletts", wiki: "Owletts" },
  { id: 14, name: "The Needles Old Battery", wiki: "The_Needles_Old_Battery" },
  { id: 15, name: "Bembridge Windmill", wiki: "Bembridge_Windmill" },
  { id: 16, name: "George Inn", wiki: "George_Inn,_Southwark" },
  { id: 17, name: "Rainham Hall", wiki: "Rainham_Hall" },
  { id: 18, name: "Blakeney Point", wiki: "Blakeney_Point" },
  { id: 19, name: "George Stephenson's Birthplace", wiki: "George_Stephenson%27s_Birthplace" },
  { id: 20, name: "Dunstanburgh Castle", wiki: "Dunstanburgh_Castle" },
  { id: 21, name: "Allen Banks", wiki: "Allen_Banks_and_Staward_Gorge" },
  { id: 22, name: "Robin Hood's Bay", wiki: "Robin_Hood%27s_Bay" },
  { id: 23, name: "Roseberry Topping", wiki: "Roseberry_Topping" },
  { id: 24, name: "Goddards House", wiki: "Goddards_(house)" },
  { id: 25, name: "Mount Grace Priory", wiki: "Mount_Grace_Priory" },
  { id: 26, name: "Marsden Moor", wiki: "Marsden_Moor" },
  { id: 27, name: "Bath Assembly Rooms", wiki: "Assembly_Rooms,_Bath" },
  { id: 28, name: "Holnicote Estate", wiki: "Holnicote_Estate" },
  { id: 29, name: "The Firs", wiki: "The_Firs,_Lower_Broadheath" },
  { id: 30, name: "The Greyfriars", wiki: "Greyfriars,_Worcester" },
];

for (const prop of properties) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${prop.wiki}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.originalimage?.source) {
      console.log(`${prop.id} | ${prop.name} | ${data.originalimage.source}`);
    } else if (data.thumbnail?.source) {
      const orig = data.thumbnail.source.replace(/\/\d+px-/, '/1024px-');
      console.log(`${prop.id} | ${prop.name} | ${orig} (from thumbnail)`);
    } else {
      console.log(`${prop.id} | ${prop.name} | NO IMAGE`);
    }
  } catch (e) {
    console.log(`${prop.id} | ${prop.name} | ERROR: ${e.message}`);
  }
}
