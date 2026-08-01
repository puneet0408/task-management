import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client  , GetObjectCommand} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID).trim(),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY).trim(),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const createPresignedUrlWithClient = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        message: "fileName and fileType are required",
      });
    }

    const bucket = process.env.AWS_BUCKET_NAME;
    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,  // ✅ lock content type into signature
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    return res.status(200).json({
      success: true,
      uploadUrl: url,
      fileUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("S3 Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating presigned URL",
      error: error.message,
    });
  }
};

export const getPresignedViewUrl = async (req, res) => {
  try {
    const { id: key } = req.params;
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error("S3 Get Error:", error);
    return res.status(500).json({ success: false, message: "Error generating view URL" });
  }
};