import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const runpod_key = process.env.RUNPOD_API_KEY
const runpod_url = "https://api.runpod.ai/v2/8cu1tfdpvvx664/runsync"

export async function GET(req: NextRequest): Promise<NextResponse>  {

      try {
          const headers = {
              "Content-Type": "applicatiion/json",
              "Authorization": runpod_key
          }
          const data = {
              input: {
                  action: "/voice",
                  model_id: 0,
                  text: "音声合成イニシャライズ"
              }
          }
        await axios.post(runpod_url, data, {headers:headers});
        console.log("runpod initialized")
        return NextResponse.json({ initialize:"OK"});
        } catch (error) {
            return NextResponse.json({ error: error });
        }
}