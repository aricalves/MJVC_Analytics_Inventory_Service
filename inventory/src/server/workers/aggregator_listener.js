const easy = require('easy-sqs');
require('dotenv').config();

const { updatePopularity } = require('../../db/index');

const awsConfig = { 'accessKeyId': process.env.ACCESS_KEY, 'secretAccessKey': process.env.SECRET, 'region': process.env.REGION };

const url = process.env.AGGREGATOR_URL;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});
console.log(`Connected to ${queue.queueName.split('/')[4]}...`);

const deleteAggregatorMessage = msg => {
  queue.deleteMessage(msg, err => {
    console.error(err);
  });
};

const updatePopularList = ({ popular, unpopular }) => {
  Promise.all(popular.map(id => updatePopularity(id, true)));
  Promise.all(unpopular.map(id => updatePopularity(id, false)));
};

const pollAggregatorQueue = () => (
  queue.getMessage((err, msg) => {
    if (err) { throw err; }
    const popularityList = JSON.parse(msg['Body']);
    Promise.resolve(updatePopularList(popularityList))
      .then(() => deleteAggregatorMessage(msg))
      .catch(e => console.error(e));
  })
);

setInterval(() => { pollAggregatorQueue(); }, 500);
