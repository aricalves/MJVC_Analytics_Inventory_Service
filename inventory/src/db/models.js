const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_HOST, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  define: { timestamps: false }
});

module.exports = {
  sequelize,
  Review: sequelize.define('reviews', {
    user_id: Sequelize.INTEGER,
    rating: Sequelize.INTEGER,
    body: Sequelize.TEXT,
    timestamp: Sequelize.DATE
  }),
  Category: sequelize.define('categories', {
    title: Sequelize.STRING,
  }),
  Host: sequelize.define('hosts', {
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    description: Sequelize.TEXT,
    photo_url: Sequelize.TEXT,
  }),
  Location: sequelize.define('locations', {
    country: Sequelize.STRING,
    state: Sequelize.STRING,
    city: Sequelize.STRING,
    address: Sequelize.STRING
  }),
  Experience: sequelize.define('experiences', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    photo_url: Sequelize.TEXT,
    is_available: { type: Sequelize.BOOLEAN, defaultValue: false },
    is_popular: { type: Sequelize.BOOLEAN, defaultValue: false },
    rating: Sequelize.INTEGER,
    review_count: Sequelize.INTEGER,
    price: Sequelize.INTEGER
  }, {
    indexes: [
      {
        name: 'idx_price',
        fields: ['price']
      },
      {
        name: 'idx_rating',
        fields: ['rating']
      },
      {
        name: 'idx_location',
        fields: ['locationId']
      },
      {
        name: 'idx_available',
        fields: ['is_available']
      },
      {
        name: 'idx_popular',
        fields: ['is_popular']
      }
    ]
  })
};