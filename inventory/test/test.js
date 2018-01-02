require('dotenv').config();
const assert = require('assert');
const supertest = require('supertest');
const expect = require('chai').expect;
const server = supertest(`http://localhost:${process.env.PORT}`);

const helpers = require('../src/server/helpers');

const experienceClone = { id: 1234, title: 'foo', description: 'bar', photo_url: 'https://lorempixel.con/640/400/cats', is_available: false, is_popular: false, rating: 4, review_count: 4, price: 120, locationId: -1560504360, hostId: 12345, categoryId: 12345 };

describe('helpers', () => {

  describe('#parseHost()', () => {
    it('should return an object with keys that match the host table', () => {
      const queryStr = 'endpoint?first_name=aric&last_name=alves&description=fooandbar&photo_url=image.jpg';
      assert.deepEqual(Object.keys(helpers.parseHost(queryStr)), ['first_name', 'last_name', 'description', 'photo_url']);
    });
    it('should return an object with values that match the input', () => {
      const queryStr = 'http://localhost:8080/experiences/add/host?first_name=fred&last_name=x&description=henlo|ugly|turtle&photo_url=yes.com';
      const expected = { first_name: 'fred', last_name: 'x', description: 'henlo ugly turtle', photo_url: 'yes.com' };
      assert.deepEqual(helpers.parseHost(queryStr), expected);
    });
    it('should parse http requests', () => {
      const queryStr = 'endpoit?first_name=queen&last_name=kitty&description=meow%7Cme-meow%7Cmeow%7Cmeow%7Cmeow%7Cmeow.%7Cunce%7Cunce%7Cunce-%7Cka%7Cka%7Cka%7Ckitty%7Ckat%7Ckitty%7Ckitty%7Ckitty%7Ckat&photo_url=https://lorempixel.com/640/400/cats';
      const expected = { first_name: 'queen', last_name: 'kitty', description: 'meow me-meow meow meow meow meow. unce unce unce- ka ka ka kitty kat kitty kitty kitty kat', photo_url: 'https://lorempixel.com/640/400/cats' };
      assert.deepEqual(helpers.parseHost(queryStr), expected);
    });
  });

  describe('#hash()', () => {
    const sfHash = 1071122462;
    it('should return a hash code', () => {
      expect(helpers.hash('SanFranciscoCA')).to.be.a('number');
    });
    it('should return the same hash regardless of case', () => {
      assert.equal(helpers.hash('SanFranciscoCA'), helpers.hash('sAnFRancIsCOCa'));
    });
    it('should always return the same hash code for a given location', () => {
      let hash = true;
      let i = 0;
      while (i < 1000) {
        hash = helpers.hash('SanFranciscoCA') === sfHash;
        if (!hash) { break; }
        i++;
      }
      expect(hash).to.equal(true);
    });
  });

  describe('#handleError()', () => {
    it('should accept error objects', () => {
      const foo = new Error();
      expect(helpers.handleError(foo, '/test')).to.eql('Error has been logged.');
    });

    it('should reject non-error objects', () => {
      expect(helpers.handleError({}, '/test')).to.eql('Non-error sent to #handleError()');
    });
  });

});

describe('inventory server', () => {

  describe('/', () => {
    it('should be online', (done) => {
      server
        .get('/')
        .expect(200, done);
    });
  });

  describe('/experiences/manage', () => {

    it('should respond with an experience id', done => {
      server
        .patch('/experiences/manage/100')
        .send({ 'action': 'delete' })
        .expect(200)
        .end((error, response) => {
          if (error) { return done(error); }
          expect(response.text).to.eql('Experience 100 does not exist');
          done();
        });
    });

    it('should delete specified experience', () => {
      return server
        .post('/experiences/add')
        .send(experienceClone)
        .expect(200)
        .then(res => {
          expect(res.text).to.eql('Your experience has been added.');
        })
        .then(() => (
          server
            .patch('/experiences/manage/1234')
            .send({ 'action': 'delete' })
            .expect(200)
        ))
        .then(res => {
          expect(res.text).to.eql('Deleted experience with id: 1234');
        })
        .then(() => (
          server
            .patch('/experiences/manage/1234')
            .send({ 'action': 'delete' })
            .expect(200)
        ))
        .then(res => {
          expect(res.text).to.eql('Experience 1234 does not exist');
        });
    });

    it('should pause a specified experience', () => {
      server
        .patch('/experiences/manage/12345')
        .send({ 'action': 'pause' })
        .expect(200)
        .then(res => {
          expect(res.text).to.eql('paused experience with id: 12345');
        });
    });
    
    it('should unpause a specified experience', () => {
      server
        .patch('/experiences/manage/12345')
        .send({ 'action': 'unpause' })
        .expect(200)
        .then(res => {
          expect(res.text).to.eql('unpaused experience with id: 12345');
        });
    });
  });

  describe('/experiences/find/:locationId', () => {

    const locations = [58272262, 309509055, -1029232454, 424363964, -1560504030, 405528837, -1094817086, 964775685, 309508705, 58272471, -1574806155, -147471123, -559866342, -365845644, -1674988926, -1094817096, 1143831738, -837388837, 424363948, -1247473086];
    beforeEach(() => {
      const randomIndex = Math.trunc(Math.random() * locations.length);
      return randomLocation = locations[randomIndex];
    });

    it('should not fail when no query input', done => {
      server
        .get(`/experiences/find/${randomLocation}`)
        .expect(200)
        .end((e, response) => {
          if (e) { return done(e); }
          expect(JSON.parse(response.text).length).to.eql(36);
          done();
        });
    });

    it('should return 36 experiences', done => {
      server
        .get(`/experiences/find/${randomLocation}`)
        .query({ sortBy: 'price' })
        .expect(200)
        .end((e, response) => {
          if (e) { return done(e); }
          expect(JSON.parse(response.text).length).to.eql(36);
          done();
        });
    });

    it('should return experience objects', done => {
      const randomIndex = Math.floor(Math.random() * 36);
      server
        .get(`/experiences/find/${randomLocation}`)
        .expect(200)
        .end((e, response) => {
          if (e) { return done(e); }
          const randomExperience = JSON.parse(response.text)[randomIndex];
          expect(Object.keys(randomExperience)).to.eql(Object.keys(experienceClone));
          done();
        });
    });

  });

});
