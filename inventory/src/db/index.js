const models = require('./models');

models.sequelize.authenticate()
  .tap(() => console.log('sequelize is listening...'))
  .catch(err => console.error('Unable to connect to the database:', err));

const syncTables = () => Promise.resolve(models.sequelize.sync());

/******************** DEFINE FOREIGN KEYS ***********************/

models.Review.belongsTo(models.Experience);
models.Location.hasMany(models.Experience);
models.Host.hasMany(models.Experience);
models.Category.hasMany(models.Experience);

/************************ LOGIC BELOW ***************************/

const addExperience = (experience) => {
  const id = experience.id || Math.trunc(Math.random() * 200000000) + 1000000;
  return models.Experience.findCreateFind({
    where: {
      locationId: experience.locationId,
      title: experience.title,
      hostId: experience.hostId
    },
    defaults: {
      id,
      is_popular: experience.is_popular,
      is_available: experience.is_available,
      description: experience.description,
      photo_url: experience.photo_url,
      rating: experience.rating,
      review_count: experience.review_count,
      price: experience.price,
      categoryId: experience.categoryId
    }
  });
};

const addHost = ({ first_name, last_name, description, photo_url }) => {
  const id = Math.trunc(Math.random() * 200000000) + 9000000;
  return models.Host.findCreateFind({ where: { first_name, last_name }, defaults: { id, description, photo_url }});
};

const addReview = ({ user_id, rating, body, timestamp, experienceId }) => {
  const id = Math.trunc(Math.random() * 200000000) + 6000000;
  return models.Review.findCreateFind({ where: { body, user_id }, defaults: { id, rating, timestamp, experienceId } });
};

const deleteHost = id => models.Host.destroy({ where: { id } });

const deleteExperience = id => models.Experience.destroy({ where: { id } });

const deleteReview = id => models.Review.destroy({ where: { id } });

const findPopularLocations = (id, sort, page) => {
  return page > 1 ?
    Promise.resolve([]) :
    models.Experience.findAll({ where: { locationId: id, is_popular: true }, order: [ sort ], limit: 36 });
};

const findLocations = (id, sort, limit, page, offset) => {
  offset = page > 1 ? offset + (96 * (page - 1)) : offset;
  return models.Experience.findAll({ where: { locationId: id, is_popular: false }, order: [ sort ], limit, offset, });
};

const manageExperience = (id, action) => {
  const active = action === 'unpause';
  return models.Experience.update({ is_available: active }, { where: { id } });
};

const updatePopularity = () => 'Updated Popularity';

exports.addExperience = addExperience;
exports.addHost = addHost;
exports.addReview = addReview;
exports.deleteHost = deleteHost;
exports.deleteExperience = deleteExperience;
exports.deleteReview = deleteReview;
exports.findLocations = findLocations;
exports.findPopularLocations = findPopularLocations;
exports.manageExperience = manageExperience;
exports.syncTables = syncTables;
exports.updatePopularity = updatePopularity;
