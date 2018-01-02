const easy = require('easy-sqs');
const db = require('../../db/index');
const help = require('../helpers');

const awsConfig = { 'accessKeyId': process.env.ACCESS_KEY, 'secretAccessKey': process.env.SECRET, 'region': process.env.REGION };

const url = process.env.REVIEW_QUEUE;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});
console.log(`Connected to ${queue.queueName.split('/')[4]}...`);

const deleteReviewMessage = msg => {
  queue.deleteMessage(msg, err => {
    console.error(err);
  });
};

const checkReviewQueue = () => {
  queue.getMessage((err, msg) => {
    if (err) { throw err; }
    const review = JSON.parse(msg['Body']);
    if (review.delete) {
      db.deleteReview(review.id)
        .then(dbResponse => {
          const message = dbResponse ? 'Your review has been deleted.' : 'Review does not exist.';
          console.log(message);
        })
        .catch(e => { help.handleError(e, `/experiences/delete/review/${req.params.reviewId}`); })
        .then(() => { deleteReviewMessage(msg); });
    } else {
      db.addReview(review)
        .catch(e => { help.handleError(e, 'experiences/add/review'); })
        .then(() => { console.log('New review added.'); })
        .then(() => { deleteReviewMessage(msg); });
    }
  });
};

const sendMessage = (message) => {
  let msg = JSON.stringify(message);
  queue.sendMessage(msg, function(err) {
    console.log('sent!');
    if (err) { console.error('send failed!', err); }
  });
};

setInterval(() => { checkReviewQueue(); }, 5000);
