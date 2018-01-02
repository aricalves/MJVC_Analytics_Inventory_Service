const easy = require('easy-sqs');

const awsConfig = { 'accessKeyId': process.env.ACCESS_KEY, 'secretAccessKey': process.env.SECRET, 'region': process.env.REGION };

const url = process.env.AGGREGATOR_QUEUE;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});
console.log(`Connected to ${queue.queueName.split('/')[4]}...`);

const manageExperience = ({ id, locationId, action }) => {
  let msg = JSON.stringify({ id, locationId, action });
  queue.sendMessage(msg, function(err) {
    if (err) { console.error('send failed!', err); }
  });
};

module.exports.manageExperience = manageExperience;
