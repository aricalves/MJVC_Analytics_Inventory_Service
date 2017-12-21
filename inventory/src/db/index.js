const Sequelize = require('sequelize');

const sequelize = new Sequelize('anotha', 'aric', 'Inc0rrect', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  define: { timestamps: false }
});

sequelize.authenticate()
  .tap(() => {
    console.log('sequelize is listening...');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const syncTables = () => Promise.resolve(sequelize.sync());

/******************** DEFINE MODELS ***********************/

const Review = sequelize.define('reviews', {
  user_id: Sequelize.INTEGER,
  rating: Sequelize.INTEGER,
  body: Sequelize.TEXT,
  timestamp: Sequelize.DATE
});

const Category = sequelize.define('categories', {
  title: Sequelize.STRING,
});

const Host = sequelize.define('hosts', {
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING,
  description: Sequelize.TEXT,
  photo_url: Sequelize.TEXT,
});

const Location = sequelize.define('locations', {
  country: Sequelize.STRING,
  state: Sequelize.STRING,
  city: Sequelize.STRING,
  address: Sequelize.STRING
});

const Experience = sequelize.define('experiences', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  photo_url: Sequelize.TEXT,
  is_available: Sequelize.BOOLEAN,
  is_popular: Sequelize.BOOLEAN,
  rating: Sequelize.INTEGER,
  review_count: Sequelize.INTEGER,
  price: Sequelize.INTEGER,
});

Review.belongsTo(Experience);
Location.hasMany(Experience);
Host.hasMany(Experience);
Category.hasMany(Experience);

/****************** END DEFINE MODELS *********************/

const addExperience = (experience) => {
  const id = Math.trunc(Math.random() * 200000000) + 1000000;
  return Experience.findCreateFind({
    where: {
      locationId: experience.location_id,
      title: experience.title,
      hostId: experience.host_id
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
      categoryId: experience.category_id
    }
  });
};

const addHost = ({ first_name, last_name, description, photo_url }) => {
  const id = Math.trunc(Math.random() * 200000000) + 9000000;
  return Host.findCreateFind({ where: { first_name }, defaults: { id, last_name, description, photo_url }});
};

const addReview = ({ user_id, rating, body, timestamp, experienceId }) => {
  const id = Math.trunc(Math.random() * 200000000) + 6000000;
  return Review.findCreateFind({ where: { body, user_id }, defaults: { id, rating, timestamp, experienceId } });
};

const deleteHost = id => Host.destroy({ where: { id } });

const deleteExperience = id => Experience.destroy({ where: { id } });

const deleteReview = id => Review.destroy({ where: { id } });

exports.addExperience = addExperience;
exports.addHost = addHost;
exports.addReview = addReview;
exports.deleteHost = deleteHost;
exports.deleteExperience = deleteExperience;
exports.deleteReview = deleteReview;
exports.syncTables = syncTables;
