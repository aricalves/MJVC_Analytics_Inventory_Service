const assert = require('assert');
const supertest = require('supertest');
const expect = require('chai').expect;
const server = supertest('http://localhost:8080');

const helpers = require('../src/server/helpers');

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
      const notError = 'bar';
      expect(helpers.handleError(notError, '/test')).to.eql('Non-error sent to #handleError()');
    });
  });

});

describe('inventory server', () => {

  describe('/ (root)', () => {
    it('should be online', (done) => {
      server
        .get('/')
        .expect(200, done);
    });
  });

  describe('/experiences/manage', () => {
    it('should respond with an experience id', done => {
      server
        .delete('/experiences/manage/100')
        .expect(200)
        .end((error, response) => {
          if (error) { done(error); }
          assert(response, 'Experience 100 does not exist');
          done();
        });
    });
    it('should delete specified experience', done => { // This has a random chance of failing
      const randomExperience = Math.trunc(Math.random() * 10000000);
      server
        .delete(`/experiences/manage/${randomExperience}`)
        .expect(200)
        .end((error, response) => {
          if (error) { done(error); }
          assert(response, `Deleted experience with id: ${randomExperience}`);
        });
      server
        .delete(`/experiences/manage/${randomExperience}`)
        .expect(200)
        .end((error, response) => {
          if (error) { done(error); }
          assert(response, `Experience ${randomExperience} does not exist`);
          done();
        });

    });
  });

});
