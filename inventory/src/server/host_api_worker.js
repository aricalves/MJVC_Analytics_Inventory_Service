const easy = require('easy-sqs');

const secret = require('../../config/config');

const awsConfig = { 'accessKeyId': secret.amazon_keys.ACCESS_KEY, 'secretAccessKey': secret.amazon_keys.SECRET, 'region': secret.amazon_keys.REGION };

const url = secret.amazon_keys.QUEUE_URL;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});
console.log(`Connected to ${queue.queueName.split('/')[4]}...`);

const deleteMessage = msg => {
  queue.deleteMessage(msg, err => {
    console.error(err);
  });
};

const checkQueue = () => {
  queue.getMessage((err, msg) => {
    if (err) { throw err; }
    console.log(msg['Body']);
    deleteMessage(msg);
  });
};

const sendMessage = (message) => {
  let msg = JSON.stringify(message);
  queue.sendMessage(msg, function(err) {
    console.log('sent!');
    if (err) { console.error('send failed!', err); }
  });
};
