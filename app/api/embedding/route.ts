import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from 'next';

interface EmbeddingsModel {
  [key: string]: string;
}

interface RequestBody {
  input: string;
  attribute: string;
  modelnumber: string;
}

interface SuccessResponse {
  prompt: string;
  embedding: string;
}

interface ErrorResponse {
  embedding: any;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddingsModel: EmbeddingsModel = {"1": "text-embedding-3-small"};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const { input, modelnumber } = req.body as RequestBody;
  const model = embeddingsModel[modelnumber];

  try {
    const response = await openai.embeddings.create({
      model: model,
      input: input,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;
    const buffer = new Float32Array(embedding);
    const vectorBase64 = Buffer.from(buffer.buffer).toString('base64');

    res.status(200).json({ prompt: input, embedding: vectorBase64 });
  } catch (error) {
    res.status(400).json({ embedding: error });
  }
}