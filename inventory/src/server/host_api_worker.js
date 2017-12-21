const AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'AKIAIBCT2EKPC2W2KBMA', secretAccessKey: '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'});

const sqs = new AWS.SQS({region:'us-east-2'}); 

const msg = { payload: 'a message' };

const sqsParams = {
  MessageBody: JSON.stringify(msg),
  QueueUrl: ' https://sqs.us-east-2.amazonaws.com/489670500872/host_airbnb'
};

sqs.sendMessage(sqsParams, function(err, data) {
  if (err) {
    console.log('ERR', err);
  }
  console.log(data);
});
