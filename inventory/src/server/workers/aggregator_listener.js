const easy = require('easy-sqs');

const { updatePopularity } = require('../../db/index');

const awsConfig = { 'accessKeyId': process.env.ACCESS_KEY, 'secretAccessKey': process.env.SECRET, 'region': process.env.REGION };

const url = process.env./* TODO */;
const client = easy.createClient(awsConfig);

const queue = client.getQueueSync(url, err => {
  if (err) { throw err; }
});

const updatePopularList = () => {
  
}

module.exports.updatePopularList = updatePopularList;
