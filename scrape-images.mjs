const properties = [
  { id: 1, name: "St John's Jerusalem", wiki: "St_John%27s_Jerusalem" },
  { id: 2, name: "Darrow Wood", wiki: "Blickling_Hall" },
  { id: 3, name: "St George's Guildhall", wiki: "St_George%27s_Guildhall" },
  { id: 4, name: "Brean Down", wiki: "Brean_Down" },
  { id: 5, name: "Wellington Monument", wiki: "Wellington_Monument,_Somerset" },
  { id: 6, name: "King John's Hunting Lodge", wiki: "King_John%27s_Hunting_Lodge" },
  { id: 7, name: "Leigh Woods", wiki: "Leigh_Woods" },
  { id: 8, name: "Stoke sub Hamdon Priory", wiki: "Stoke-sub-Hamdon_Priory" },
  { id: 9, name: "Stembridge Tower Mill", wiki: "Stembridge_Tower_Mill" },
  { id: 10, name: "Cadbury Camp", wiki: "Cadbury_Camp,_Tickenham" },
  { id: 11, name: "Downs Banks", wiki: "Downs_Banks" },
  { id: 12, name: "Knowles Mill", wiki: "Bewdley" },
  { id: 13, name: "Middle Littleton Tithe Barn", wiki: "Middle_Littleton_Tithe_Barn" },
  { id: 14, name: "Rosedene", wiki: "Chartism" },
  { id: 15, name: "Wichenford Dovecote", wiki: "Wichenford" },
  { id: 16, name: "Maister House", wiki: "Maister_House" },
  { id: 17, name: "Braithwaite Hall", wiki: "East_Witton" },
  { id: 18, name: "Bridestones", wiki: "Bridestones" },
  { id: 19, name: "Yorkshire Coast", wiki: "Robin_Hood%27s_Bay" },
  { id: 20, name: "Bookham Commons", wiki: "Bookham_Commons" },
  { id: 21, name: "Clandon Park", wiki: "Clandon_Park" },
  { id: 22, name: "River Wey Navigations", wiki: "Wey_Navigation" },
  { id: 23, name: "Reigate Hill", wiki: "Reigate_Hill" },
  { id: 24, name: "Harting Down", wiki: "Harting_Down" },
  { id: 25, name: "Kinwarton Dovecote", wiki: "Kinwarton" },
  { id: 26, name: "Roundhouse Birmingham", wiki: "Roundhouse,_Birmingham" },
  { id: 27, name: "Cley Hill", wiki: "Cley_Hill" },
  { id: 28, name: "Figsbury Ring", wiki: "Figsbury_Ring" },
  { id: 29, name: "Pepperbox Hill", wiki: "Eyre%27s_Folly" },
  { id: 30, name: "Wakehurst", wiki: "Wakehurst_Place" },
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
