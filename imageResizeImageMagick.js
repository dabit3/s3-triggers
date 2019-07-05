// image resize with the sharp library

const gm = require('gm').subClass({
  imageMagick: true
})
const aws = require('aws-sdk')
const s3 = new aws.S3()

// Store Bucket name in environment variable or hard code it here
const BUCKET = process.env.BUCKET
const WIDTH = 100
const HEIGHT = 100

exports.handler = (event, context, callback) => {
  // This gets the first record in the event object (the image data we will use)
  const KEY = event.Records[0].s3.object.key
  const PARTS = KEY.split('/')

  // Here we check to see if the base folder is already set to thumbnails, if it is we return so we do not have a recursive call.
  const BASE_FOLDER = PARTS[0]
  if (BASE_FOLDER === 'thumbnails') return

  // This stores the main file name in a variable
  let FILE = PARTS[PARTS.length - 1]

  s3.getObject({ Bucket: BUCKET, Key: KEY }).promise()
    .then(image => {
      gm(image.Body)
        .resize(WIDTH, HEIGHT)
        .setFormat('jpeg')
        .toBuffer(function (err, buffer) {
          if (err) {
            console.log('error storing image: ', err)
          } else {
            s3.putObject({ Bucket: BUCKET, Body: buffer, Key: `thumbnails/thumbnail-${FILE}` }).promise()
            .then(data => {
              console.log('successfully put object:', data)
              callback(null)
            })
            .catch(err => {
              callback(err)
            })
          }
        })
    })
    .catch(err => {
      console.log('error resizing image: ', err)
      callback(err)
    })
}