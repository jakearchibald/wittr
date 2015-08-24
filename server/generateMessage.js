const transportType = [
  'underground',
  'train',
  'bus',
  'replacement bus service'
];

const transportItem = [
  'tube train',
  'train',
  'bus'
];

const transportWoes = [
  'delays',
  'cancelations',
  'signal failures',
  'changes',
  'conditions'
];

const angryWords = [
  'angry',
  'furious',
  'enraged',
  'non-plussed',
  'teed off',
  'ticked off',
  'peeved',
  'disgruntled',
  'grumpy',
  'annoyed',
  'unhappy',
  'incensed',
  'livid',
  'irritated',
  'tetchy'
];

const idiots = [
  'Boris Johnson',
  'David Cameron',
  'Russell Brand',
  'Katie Hopkins',
  'Nigel Farage',
  'Richard Littlejohn'
];

const tvShows = [
  'Question Time',
  'The Archers',
  'Eastenders',
  'The Apprentice',
  'The Bake Off',
  'Masterchef'
];

const newspapers = [
  'The Daily Mail',
  'The Sun',
  'The Express'
];

const thingsToHate = [
  'this tepid cup of tea',
  _=> `these ${pickFrom(transportType)} ${pickFrom(transportWoes)}`,
  'the weather',
  'this bus',
  'this disorganised queue',
  'the post office',
  'the person sitting next to me',
  'the guy behind me',
  'the woman next to me',
  'the bloke opposite'
].concat(idiots).concat(newspapers).concat(tvShows);

const almost = [
  'I almost',
  'I nearly',
  'I could have very nearly almost',
  'I very nearly',
  'I almost certainly could have',
  'I practically could have almost',
  'I might have',
  'I could very nearly have'
];

const seriousAction = [
  'tutted out loud',
  'sighed',
  'wrote a strongly worded letter',
  'wrote to my MP',
  'expressed my feelings',
  'called the council',
  'posted something vague on Facebook',
  'ripped my own face off, metaphorically',
  'lost the gift of silence',
  'farted uncontrollably',
  'imagined myself doing something very serious about it',
  'wrote my feelings down on a piece of paper then threw it away',
  'taken it to Twitter'
];

const reasonsToHateTheWeather = [
  _=>`I tried going outside but it's far too ${pickFrom(weatherConditions)}.`,
  _=>`I opened the window. Ugh. It's so ${pickFrom(weatherConditions)}.`,
  _=>`Have you seen the weather? Way too ${pickFrom(weatherConditions)} if you ask me.`,
  _=>`Can't help feeling the weather's too ${pickFrom(weatherConditions)} today.`,
  _=>`Can't deal with the weather being so ${pickFrom(weatherConditions)}.`,
  _=>`Nope. Can't deal with today. Too ${pickFrom(weatherConditions)}.`,
  _=>`Ugh, how am I expected to deal with these ${pickFrom(weatherConditions)} conditions.`,
  _=>`I hope it isn't as ${pickFrom(weatherConditions)} tomorrow.`
];

const weatherConditions = [
  'hot',
  'cold',
  'windy',
  'clement',
  'breezy',
  'rainy',
  'warm',
  'chilly',
  'wet',
  'damp',
  'boring'
];

const thingsOnTransport = [
  'sick',
  'screaming children',
  'loathing',
  'broken dreams',
  'football fans',
  'idiots',
  'hatred'
];

const transportConsitions = [
  'delayed',
  'cancelled',
  'overcrowed',
  _ => `particularly full of ${pickFrom(thingsOnTransport)} today`
];

const sarcasm = [
  'Oh goody.',
  'Lovely.',
  'Thank you world.',
  'Just what I needed.',
  'What more could I want?',
  'Just what the doctor ordered.'
];

const pile = [
  'pile',
  'heap',
  'tower',
  'shower',
  'torrent',
  'bag',
  'mass'
];

const criticalReview = [
  'poo',
  'plop',
  'rubbish',
  'cack',
  'excrement'
];

const imgs = [
  {url: '/imgs/wolff.jpg', alt: 'Wolff'},
];

function pickFrom(thing) {
  var item = thing[Math.floor(Math.random() * thing.length)];

  if (item instanceof Function) {
    return item();
  }
  return item;
}

const sentenceGenerators = [
  {msg: _=>`I'm so ${pickFrom(angryWords)} about ${pickFrom(thingsToHate)} ${pickFrom(almost)} ${pickFrom(seriousAction)}.`},
  {msg: _=>`${pickFrom(reasonsToHateTheWeather)}`},
  {msg: _=>`Did you see ${pickFrom(tvShows)} last night? What a ${pickFrom(pile)} of ${pickFrom(criticalReview)}.`},
  {msg: _=>`The only thing that can make things worse right now is ${pickFrom(thingsToHate)}.`},
  {msg: _=>`My ${pickFrom(transportItem)} is ${pickFrom(transportConsitions)}. ${pickFrom(sarcasm)}`},
  {msg: _=>`${pickFrom(sarcasm)} Just saw ${pickFrom(idiots)} walking past. Turned a nice day into a ${pickFrom(pile)} of ${pickFrom(criticalReview)}.`},
  {img: _=>pickFrom(imgs), msg: _=>"Here is a picture"},
];

export default function() {
  const generator = pickFrom(sentenceGenerators);
  const r = {};
  if (generator.img) {
    r.img = generator.img();
  }
  r.msg = generator.msg();
  return r;
}