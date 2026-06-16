const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const bucket = process.env.R2_BUCKET;
const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const enviarArquivo = async (buffer, key, mimetype) => {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  return key;
};

const removerArquivo = async (key) => {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

const urlPublica = (key) => (key ? `${publicUrl}/${key}` : null);

module.exports = { enviarArquivo, removerArquivo, urlPublica };
