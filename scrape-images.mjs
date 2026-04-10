const properties = [
  { id: 1, name: "Dunstable Downs", wiki: "Dunstable_Downs" },
  { id: 2, name: "Botallack Mine", wiki: "Botallack_Mine" },
  { id: 3, name: "Godrevy", wiki: "Godrevy" },
  { id: 4, name: "Sandymouth", wiki: "Sandymouth" },
  { id: 5, name: "Crook Hall", wiki: "Crook_Hall" },
  { id: 6, name: "Stainsby Mill", wiki: "Stainsby_Mill" },
  { id: 7, name: "Baggy Point", wiki: "Baggy_Point" },
  { id: 8, name: "Heddon Valley", wiki: "Heddon%27s_Mouth" },
  { id: 9, name: "Old Harry Rocks", wiki: "Old_Harry_Rocks" },
  { id: 10, name: "Coggeshall Grange Barn", wiki: "Grange_Barn,_Coggeshall" },
  { id: 11, name: "Danbury Common", wiki: "Danbury_Common" },
  { id: 12, name: "Ashleworth Tithe Barn", wiki: "Ashleworth_Tithe_Barn" },
  { id: 13, name: "Haresfield Beacon", wiki: "Haresfield_Beacon" },
  { id: 14, name: "Bembridge Fort", wiki: "Bembridge_Fort" },
  { id: 15, name: "Chiddingstone", wiki: "Chiddingstone" },
  { id: 16, name: "Old Soar Manor", wiki: "Old_Soar_Manor" },
  { id: 17, name: "Heysham Head", wiki: "Heysham" },
  { id: 18, name: "Grantham House", wiki: "Grantham_House" },
  { id: 19, name: "Blewcoat School", wiki: "Blewcoat_School" },
  { id: 20, name: "Mow Cop Castle", wiki: "Mow_Cop_Castle" },
  { id: 21, name: "Cissbury Ring", wiki: "Cissbury_Ring" },
  { id: 22, name: "Devil's Dyke", wiki: "Devil%27s_Dyke,_Brighton" },
  { id: 23, name: "Bredon Barn", wiki: "Bredon_Barn" },
  { id: 24, name: "Hawford Dovecote", wiki: "Hawford_Dovecote" },
  { id: 25, name: "Malham Tarn", wiki: "Malham_Tarn" },
  { id: 26, name: "Upper Wharfedale", wiki: "Wharfedale" },
  { id: 27, name: "Conwy Suspension Bridge", wiki: "Conwy_Suspension_Bridge" },
  { id: 28, name: "Skenfrith Castle", wiki: "Skenfrith_Castle" },
  { id: 29, name: "Rhossili", wiki: "Rhossili" },
  { id: 30, name: "Cilgerran Castle", wiki: "Cilgerran_Castle" },
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
