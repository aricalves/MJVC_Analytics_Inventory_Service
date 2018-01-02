const easy = require('easy-sqs');

const awsConfig = { 'accessKeyId': process.env.ACCESS_KEY, 'secretAccessKey': process.env.SECRET, 'region': process.env.REGION };

const url = process.env.APP_QUEUE;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});
console.log(`Connected to ${queue.queueName.split('/')[4]}...`);

const sendExperiences = (message) => {
  let msg = JSON.stringify(message);
  queue.sendMessage(msg, function(err) {
    console.log('sent!');
    if (err) { console.error('send failed!', err); }
  });
};

module.exports.sendExperiences = sendExperiences;
