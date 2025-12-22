/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 } from 'uuid';

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;

type FileDirectory =
  | 'instagram-media'
  | 'instagram-media-thumbnail'
  | 'instagram-profile-picture'
  | 'team-logo'
  | 'profile-picture'
  | 'tiktok-profile-picture'
  | 'tiktok-media-thumbnail'
  | 'tiktok-media'
  | 'youtube-media-thumbnail'
  | 'facebook-profile-picture';

export async function uploadFile(
  file: File,
  fileType: string,
  directory: FileDirectory,
  fileName: string,
  oldFileName?: string,
): Promise<string | null> {
  if (oldFileName) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldFileName,
    });
    await S3.send(deleteCommand);
  }

  const key = `${directory}/${fileName}_${v4()}${fileType}`;
  const buffer = await file.arrayBuffer();
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer as any,
  });
  const response = await S3.send(putCommand);
  if (response.$metadata.httpStatusCode === 200) {
    return '/' + key;
  }

  return null;
}

export async function uploadFileFromRemote(
  source: string,
  directory: FileDirectory,
  fileName: string,
  absoluteKey?: string,
): Promise<string | null> {
  const fileType = source.split('?')[0].split('.').pop();
  const blob = await fetch(source).then((r) => r.blob());
  const key = absoluteKey ? `${directory}/${absoluteKey}` : `${directory}/${fileName}_${v4()}.${fileType}`;
  const buffer = await blob.arrayBuffer();
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer as any,
  });
  const response = await S3.send(putCommand);
  if (response.$metadata.httpStatusCode === 200) {
    return '/' + key;
  }

  return null;
}
