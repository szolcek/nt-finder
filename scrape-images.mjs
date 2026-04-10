const properties = [
  { id: 1, name: "Sharpenhoe", wiki: "Sharpenhoe_Clappers" },
  { id: 2, name: "Whipsnade Tree Cathedral", wiki: "Whipsnade_Tree_Cathedral" },
  { id: 3, name: "Willington Dovecote", wiki: "Willington_Dovecote_and_Stables" },
  { id: 4, name: "Great Coxwell Barn", wiki: "Great_Coxwell_Barn" },
  { id: 5, name: "Boarstall Duck Decoy", wiki: "Boarstall_Duck_Decoy" },
  { id: 6, name: "Boarstall Tower", wiki: "Boarstall_Tower" },
  { id: 7, name: "Buckingham Chantry Chapel", wiki: "Buckingham_Chantry_Chapel" },
  { id: 8, name: "Dorneywood", wiki: "Dorneywood" },
  { id: 9, name: "Long Crendon Courthouse", wiki: "Long_Crendon_Courthouse" },
  { id: 10, name: "Pitstone Windmill", wiki: "Pitstone_Windmill" },
  { id: 11, name: "Ramsey Abbey Gatehouse", wiki: "Ramsey_Abbey" },
  { id: 12, name: "Cadsonbury", wiki: "Cadsonbury" },
  { id: 13, name: "Lawrence House", wiki: "Lawrence_House,_Launceston" },
  { id: 14, name: "Duffield Castle", wiki: "Duffield_Castle" },
  { id: 15, name: "The Old Manor", wiki: "Old_Manor,_Norbury" },
  { id: 16, name: "Winster Market House", wiki: "Winster_Market_House" },
  { id: 17, name: "Bolberry Down", wiki: "Bolberry_Down" },
  { id: 18, name: "Branscombe", wiki: "Branscombe" },
  { id: 19, name: "Loughwood Meeting House", wiki: "Loughwood_Meeting_House" },
  { id: 20, name: "Plymbridge Woods", wiki: "Plym_Valley" },
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
