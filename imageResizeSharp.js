/*
Image resize with the sharp library.
To install sharp for Lambda, follow the installation instructions at https://sharp.pixelplumbing.com/en/stable/install.
*/

const sharp = require('sharp')
const aws = require('aws-sdk')
const s3 = new aws.S3()

const WIDTH = 100
const HEIGHT = 100

exports.handler = async (event, context) => {
  const BUCKET = event.Records[0].s3.bucket.name

  // Gets the first record in the event object (the image data we will use)
  const KEY = event.Records[0].s3.object.key
  const PARTS = KEY.split('/')

  // Check to see if the base folder is already set to thumbnails, if it is we return so we do not have a recursive call.
  const BASE_FOLDER = PARTS[0]
  if (BASE_FOLDER === 'thumbnails') return

  // Stores the main file name in a variable
  let FILE = PARTS[PARTS.length - 1]

  try {
    const image = await s3.getObject({ Bucket: BUCKET, Key: KEY }).promise()

    const resizedImg = await sharp(image.Body).resize(WIDTH, HEIGHT).toBuffer()

    await s3.putObject({ Bucket: BUCKET, Body: resizedImg, Key: `thumbnails/thumbnail-${FILE}` }).promise()

    return
  }
  catch(err) {
    context.fail(`Error resizing files: ${err}`);
  }
}
