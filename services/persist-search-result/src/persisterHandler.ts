const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')
const AWSClient = process.env.IS_OFFLINE ? AWS : AWSXRay.captureAWS(AWS)
const table = process.env.dynamoTable
const docClient = new AWSClient.DynamoDB.DocumentClient()

const createNewItemToDynamo = async (item) => {
  const params = {
    TableName: table,
    Item: {
      placeOfBusinessId: item.storeId,
      searchString: item.queryString,
      hits: item.hits,
      timestamp: item.timestamp,
      searchCount: 1,
    },
  }
  return new Promise(async (resolve, reject) => {
    docClient.put(params, function (err, data) {
      if (err) {
        console.error('Unable to persist search', '. Error JSON:', JSON.stringify(err, null, 2))
      } else {
        resolve(item)
      }
    })
  })
}

module.exports.sqsToDynamo = async (event) => {
  let items = []
  for (let record of event.Records) {
    const event = JSON.parse(record.body)
    if (event.queryString) {
      const reply = await createNewItemToDynamo(event)
      items.push(reply)
    }
  }
  return items
}
