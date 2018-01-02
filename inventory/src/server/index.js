const express = require('express');
require('dotenv').config();
const bp = require('body-parser').json();
const flatten = require('lodash.flatten');
Promise = require('bluebird');

const app = express();
const db = require('../db/index');
const help = require('./helpers');
const sendExperiences = require('./workers/app_queue').sendExperiences;
const reportExperienceUpdate = require('./workers/aggregator_queue').manageExperience;

db.syncTables()
  .then(() => app.listen(process.env.PORT, () => console.log(`listening on ${process.env.PORT}`)));

app.options('/', (req, res) => res.send('GET, PATCH, POST, OPTIONS'));

app.get('/', (req, res) => res.sendStatus(200));

app.get('/experiences/find/:locationId', (req, res) => {
  const locationId = Number(req.params.locationId);
  const sortOrder = req.query.sortBy || 'id';
  const page = req.query.page || 1;
  db.findPopularLocations(locationId, sortOrder, page)
    .then(popExperiences => {
      if (popExperiences.length === 36) {
        res.send(popExperiences);
        return false;
      }
      return db.findLocations(locationId, sortOrder, 36 - popExperiences.length, page, 0)
        .then(experiences => [experiences, popExperiences]);
    })
    .catch(e => help.handleError(e, `/experiences/find/${locationId}`))
    .then(locations => {
      if (!locations) { return sortOrder; }
      if (locations[0].length === 0) {
        res.send('No experiences available for that location.');
        return false;
      }
      res.send(flatten(locations));
      return sortOrder;
    })
    .catch(e => help.handleError(e, `/experiences/find/${location}`))
    .then(sort => {
      if (!sort) { return; }
      let offset = 36;
      while (offset <= 84) {
        db.findLocations(locationId, sort, 12, page, offset)
          .then(payload => sendExperiences(payload));
        offset += 12;
      }
      offset = 36;
    });
});

app.get('/experiences/cats', (req, res) => res.send('<img src=https://lorempixel.com/1280/800/cats></img>'));

app.post('/experiences/add', bp, (req, res) => {
  db.addExperience(req.body)
    .tapCatch(dbResponse => {
      if (dbResponse instanceof Error) {
        res.send('Encountered a problem entering your experience.');
        throw help.handleError(dbResponse, '/experiences/add');
      }
    })
    .tap(dbResponse => {
      const message = dbResponse[1] ? 'Your experience has been added.' : 'This experience already exists!';
      res.send(message);
    })
    .then(dbResponse => { 
      if (dbResponse[1]) {
        const experience = dbResponse[0].dataValues;
        experience.action = 'add';
        reportExperienceUpdate(experience);
      }
    })
    .catch(e => console.error(e));
});

app.patch('/experiences/manage/:experienceId', bp, (req, res) => {
  const id = req.params.experienceId;
  const { action } = req.body;
  if (action === 'delete') {
    db.deleteExperience(id)
      .then(dbResponse => {
        if (dbResponse) {
          reportExperienceUpdate({ id, action });
          return res.send(`Deleted experience with id: ${id}`);
        }
        throw dbResponse;
      })
      .catch(e => {
        if (typeof e === 'number') {
          return res.send(`Experience ${id} does not exist`);
        }
        help.handleError(e, `/experiences/manage/${id}`);
      });
  } else {
    db.manageExperience(id, action)
      .then(didUpdate => {
        if (didUpdate[0]) {
          reportExperienceUpdate({ id, action });
          res.send(`${action}d experience with id: ${id}`);
        } else {
          res.send(`Can not update experience with id: ${id} at this time.`);
          throw didUpdate;
        }
      })
      .catch(e => help.handleError(e, `/experiences/manage/${id}`));
  }
});
