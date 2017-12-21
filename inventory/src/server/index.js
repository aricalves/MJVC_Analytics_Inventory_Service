const express = require('express');
const bp = require('body-parser').json();
Promise = require('bluebird');

const app = express();
const db = require('../db/index');
const help = require('./helpers');

db.syncTables()
  .then(() => app.listen(8080, () => console.log('listening on 8080')));

app.options('/', (req, res) => res.send('GET, POST, DELETE, OPTIONS'));

app.get('/', (req, res) => res.sendStatus(200));

app.get('/experiences/find/:locationId', (req, res) => {
  // query the data base for the location's 36 popular experiences,
  //   if the location has popular experiences send them over
  //     then search for unpopular experiences sorted by ? TODO limited by 12
  //     then search again with an offset of (36 + 12) limit 12
  //     repeat until we reach 96 sent, done.
  //   if the location doesnt have any popular experiences query again for location id sorted by ? TODO limit 36
  //     then search again with the same criteria offset 36 limit 12
  //     then search again with an offset of (36 + 12) limit 12
  //     repeat until we reach 96 sent, done.
  
});

app.get('/experiences/cats', (req, res) => res.send('<img src=https://lorempixel.com/1280/800/cats></img>'));

app.get('/experiences/add/host', (req, res) => {
  Promise.resolve(help.parseHost(req.url))
    .then(host => db.addHost(host))
    .then(() => res.send('Successfully added host'))
    .catch(e => {
      help.handleError(e, 'experiences/add/host');
      res.send('Encountered an error while entering host details.');
    });
});
  
app.post('/experiences/add', bp, (req, res) => {
  db.addExperience(req.body)
    .tapCatch(dbResponse => {
      if (dbResponse instanceof Error) {
        res.send('Encountered a problem entering your experience.');
        throw help.handleError(dbResponse, '/experiences/add');
      }
    })
    .then(dbResponse => {
      const message = dbResponse[1] ? 'Your experience has been added.' : 'This experience already exists!';
      res.send(message);
    })
    .catch(e => console.error(e));
});

app.post('/experiences/add/review', bp, (req, res) => {
  db.addReview(req.body)
    .then(() => res.send('Successfully added review'))
    .catch(e => {
      help.handleError(e, '/experiences/add/review');
      res.send('Encountered an error while entering your review.');
    });
});

app.delete('/experiences/manage/:experienceId', (req, res) => {
  db.deleteExperience(req.params.experienceId)
    .then(dbResponse => {
      if (dbResponse) {
        return res.send(`Deleted experience with id: ${req.params.experienceId}`);
      }
      throw dbResponse;
    })
    .catch(e => {
      if (typeof e === 'number') {
        return res.send(`Experience ${req.params.experienceId} does not exist`);
      }
      help.handleError(e, `/experiences/manage/${req.params.experienceId}`);
    });
});

app.delete('/experiences/delete/host/:userId', (req, res) => {
  db.deleteHost(req.params.userId)
    .then(dbResponse => {
      const message = dbResponse ? 'Host has been deleted.' : 'Host does not exist.';
      res.send(message);
    })
    .catch(e => {
      res.send('Host cannot be deleted at this time.');
      return help.handleError(e, `/experiences/delete/host/${req.params.userId}`);
    });
});

app.delete('/experiences/delete/review/:reviewId', (req, res) => {
  db.deleteReview(req.params.reviewId)
    .then(dbResponse => {
      const message = dbResponse ? 'Your review has been deleted.' : 'Review does not exist.';
      res.send(message);
    })
    .catch(e => {
      res.send('Encountered a problem deleting review.');
      return help.handleError(e, `/experiences/delete/review/${req.params.reviewId}`);
    });
});

exports.app = app;
