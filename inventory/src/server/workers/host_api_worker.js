const easy = require('easy-sqs');
const db = require('../../db/index');
const help = require('../helpers');

const awsConfig = { 'accessKeyId': process.env.ACCESS_KEY, 'secretAccessKey': process.env.SECRET, 'region': process.env.REGION };

const url = process.env.HOST_QUEUE;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});
console.log(`Connected to ${queue.queueName.split('/')[4]}...`);

const deleteHostMessage = msg => {
  queue.deleteMessage(msg, err => {
    console.error(err);
  });
};

const checkHostQueue = () => {
  queue.getMessage((err, msg) => {
    if (err) { throw err; }
    const host = JSON.parse(msg['Body']);
    if (host.delete) {
      db.deleteHost(host.id)
        .then(dbResponse => {
          const message = dbResponse ? 'Host has been deleted.' : 'Host does not exist.';
          console.log(message);
        })
        .catch(e => { help.handleError(e, `/experiences/delete/host/${req.params.userId}`); })
        .then(() => deleteHostMessage(msg));
    } else {
      db.addHost(host)
        .catch(e => { help.handleError(e, 'experiences/add/host'); })
        .then(() => { console.log('New host added.'); })
        .then(() => { deleteHostMessage(msg); });
    }
  });
};

setInterval(() => { checkHostQueue(); }, 500);
