const faker = require('faker');
const fs = require('fs');

const ids = require('../data/locIds');

const mil = 1000000;

String.prototype.hashCode = function() {
  this.toLowerCase();
  let hash = 0;
  let i, chr;
  if (this.length === 0) { return hash; }
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

const sentence = 'In est minima. Et dolorem quisquam. Debitis dolor totam laboriosam enim iusto doloribus aliquam. Saepe ut cumque repellendus neque enim in et sint fugiat. Aut consequuntur in perferendis perferendis molestiae impedit.';
const paragraph = sentence.repeat(3);

const getRandomLocationId = () => {
  const index = Math.floor(2000 * Math.random());
  return ids[index];
};

// THIS ONE WILL DEFINITELY BREAK SOMETHING
const generateExperiences = function(amt, count) {
  const stream = fs.createWriteStream('src/data/experiences.csv', { 'flags': 'a' });
  let exp = '';
  for (let i = (amt * count - amt); i < amt * count; i++) {
    let word = faker.random.word();
    word = word.replace(/,/g, '');
    exp = `${i},${word},${paragraph},https://lorempixel.com/640/400/cats,${false},${(Math.trunc(Math.random() * 100) + 1) > 35},${Math.trunc(Math.random() * 6)},${Math.trunc(Math.random() * 90)},${Math.trunc(Math.random() * 200) + 15},${getRandomLocationId()},${Math.trunc(Math.random() * mil * 9)},${Math.trunc(Math.random() * mil * 3.9)}\n`;
    stream.write(exp, (err) => { if (err) { console.log(err); } });
  }
  stream.end();
};

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

let cities = [ 'Bernietown', 'East Margaretteland', 'Lake Shanna', 'Lake Theo', 'South Vinnieland', 'West Francescachester', 'Hansborough', 'Lake Judsonfort', 'West Austinberg', 'West Juniusside', 'Germainestad', 'Steubertown', 'Evelinetown', 'Lake Florian', 'New Waylon', 'West Savanna', 'Zechariahfort', 'West Miguelmouth', 'West Marcellaberg', 'Schillerville', 'Kochfurt', 'East Kenya', 'Reubenstad', 'Andersonchester', 'Lake Chauncey', 'MacGyverfort', 'West Clemmie', 'New Priscilla', 'New Priscillafurt', 'East Chaya', 'Roobburgh', 'Goldnerport', 'North Jaydaville', 'Jenkinstown', 'Lake Meghan', 'Hillsland', 'Robertsside', 'Tromptown', 'Torphyville', 'South Bruce' ];
let locationIds = [];

const generateLocations = function() {
  const stream = fs.createWriteStream('src/data/locations.csv', { 'flags': 'a' });
  let loc = '';
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    for (let j = 0; j < cities.length; j++) {
      const city = cities[j];
      const id = `${city + state}`.hashCode();
      loc = `${id},United States,${state},${city},${faker.address.streetAddress()}\n`;
      stream.write(loc, (err) => {
        if (err) { console.log(err.message); }
      });
      locationIds.push(id);
    }
  }
  stream.end();
  fs.writeFile('src/data/locIds.csv', JSON.stringify(locationIds), err => {
    console.log(err);
  });
};

const generateCategories = function(amt, count) {
  const stream = fs.createWriteStream('src/data/categories.csv', { 'flags': 'a' });
  let cats = '';
  for (let i = (amt * count - amt); i < amt * count; i++) {
    const word = faker.random.word();
    word.replace(/[,]/g, '');
    cats = `${i},${word}\n`;
    stream.write(cats, (err) => {
      if (err) { console.log(err.message); }
    });
  }
  stream.end();
};

const generateReviews = function(amt, count) {
  const stream = fs.createWriteStream('src/data/reviews.csv', { 'flags': 'a' });
  let rev = '';
  for (let i = (amt * count - amt); i < amt * count; i++) {
    let month = Math.floor(Math.random() * 12) + 1;
    let day = Math.floor(Math.random() * 28) + 1;
    rev = `${i},${Math.floor(i * Math.random()) + 1},${Math.trunc(Math.random() * 5)},${sentence},${Math.floor(Math.random() * 9 * mil) + 1},2017-${month}-${day}\n`;
    stream.write(rev, (err) => { if (err) { console.log(err); } });
  }
  stream.end();
};

const generateHosts = function(amt, count) {
  const stream = fs.createWriteStream('src/data/hosts2.csv', { 'flags': 'a' });
  let person = '';
  for (let i = (amt * count - amt); i < amt * count; i++) {
    if (!(i % 200000)) {
      global.gc();
    }
    person = `${i},${faker.name.firstName()},${faker.name.lastName()},${sentence},https://lorempixel.com/cats\n`;
    stream.write(person, (err) => {
      if (err) { console.log(err.message); }
    });
  }
  stream.end();
};

const run = (batch, extend) => {
  extend = extend || false;
  let i = 1;
  if (extend) {
    i = batch;
    batch = (batch * 2) - 1;
  }
  for (i; i < batch; i++) {
    const start = Date.now();
    console.log(`Start generating batch of ${i} million rows`);
    generateReviews(mil, i);
    console.log(`Finish ${i} million rows at ${(Date.now() - start) * .001} seconds.`);
  }
  return true;
};
// run(7);
// time node --max-old-space-size=4096 src/db/seed.js