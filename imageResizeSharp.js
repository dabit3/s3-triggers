const sharp = require('sharp')
const aws = require('aws-sdk')
const s3 = new aws.S3()

const BUCKET = process.env.BUCKET
const WIDTH = 100
const HEIGHT = 100

exports.handler = async (event, context) => {
  const KEY = event.Records[0].s3.object.key
  const PARTS = KEY.split('/')
  const BASE_FOLDER = PARTS[0]
  if (BASE_FOLDER === 'thumbnails') return

  const LENGTH = PARTS.length
  let FILE = PARTS[LENGTH - 1]

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
