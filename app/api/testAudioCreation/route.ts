import axios from 'axios';
import md5 from 'md5';
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from 'next/server';

const runpod_key = process.env.RUNPOD_API_KEY

const runpod_url = "https://api.runpod.ai/v2/ipv7b7lbrstx3n/runsync"


export async function POST(req: NextRequest): Promise<NextResponse>  {
    const params = await req.json()
    const answer = params.answer
    const id = params.id

      try {
          const headers = {
              "Content-Type": "applicatiion/json",
              "Authorization": runpod_key
          }
          const data = {
              input: {
                  action: "/voice",
                  model_id: id,
                  text: answer
              }
          }
        const response = await axios.post(runpod_url, data, {headers:headers});
        return NextResponse.json({ audioContent: response.data.output.voice});
        } catch (error) {
            return NextResponse.json({ error: error });
        }
    }
