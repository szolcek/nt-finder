const properties = [
  { id: 1, name: "Blaise Hamlet", wiki: "Blaise_Hamlet" },
  { id: 2, name: "Coombe Hill", wiki: "Coombe_Hill,_Buckinghamshire" },
  { id: 3, name: "Carnewas at Bedruthan", wiki: "Bedruthan_Steps" },
  { id: 4, name: "St Anthony Head", wiki: "St_Anthony_Head" },
  { id: 5, name: "Penrose", wiki: "Penrose_Estate" },
  { id: 6, name: "Derwent Island House", wiki: "Derwent_Island" },
  { id: 7, name: "Shute Barton", wiki: "Shute_Barton" },
  { id: 8, name: "Ballard Down", wiki: "Ballard_Down" },
  { id: 9, name: "Bourne Mill", wiki: "Bourne_Mill" },
  { id: 10, name: "Woodchester Park", wiki: "Woodchester_Park" },
  { id: 11, name: "Horton Court", wiki: "Horton_Court" },
  { id: 12, name: "Lodge Park", wiki: "Lodge_Park" },
  { id: 13, name: "West Green House", wiki: "West_Green_House" },
  { id: 14, name: "The Weir Garden", wiki: "The_Weir_Garden" },
  { id: 15, name: "Mottistone", wiki: "Mottistone_Manor" },
  { id: 16, name: "Coldrum Long Barrow", wiki: "Coldrum_Long_Barrow" },
  { id: 17, name: "Toys Hill", wiki: "Toys_Hill" },
  { id: 18, name: "Staunton Harold Church", wiki: "Holy_Trinity_Church,_Staunton_Harold" },
  { id: 19, name: "575 Wandsworth Road", wiki: "575_Wandsworth_Road" },
  { id: 20, name: "Eastbury Manor House", wiki: "Eastbury_Manor_House" },
  { id: 21, name: "Brancaster", wiki: "Brancaster" },
  { id: 22, name: "Housesteads Roman Fort", wiki: "Housesteads" },
  { id: 23, name: "Cronkhill", wiki: "Cronkhill" },
  { id: 24, name: "Fyne Court", wiki: "Fyne_Court" },
  { id: 25, name: "King Alfred's Tower", wiki: "King_Alfred%27s_Tower" },
  { id: 26, name: "Cheddar Gorge", wiki: "Cheddar_Gorge" },
  { id: 27, name: "Avebury Manor", wiki: "Avebury_Manor" },
  { id: 28, name: "Stonehenge Landscape", wiki: "Stonehenge" },
  { id: 29, name: "The Fleece Inn", wiki: "The_Fleece_Inn,_Bretforton" },
  { id: 30, name: "Wentworth Castle Gardens", wiki: "Wentworth_Castle" },
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
