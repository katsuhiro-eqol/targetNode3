import axios from 'axios';
import md5 from 'md5';
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from 'next/server';

const runpod_key = process.env.RUNPOD_API_KEY

const runpod_url = "https://api.runpod.ai/v2/ipv7b7lbrstx3n/runsync"

const vits_param = {
    bauncer: {model_id: 0},
    voice_m: {model_id: 1},
    voice_w: {model_id: 2}
}

type VoiceType = keyof typeof vits_param;

export async function POST(req: NextRequest): Promise<NextResponse>  {
    const params = await req.json()
    const answer = params.answer
    const voice = params.voice as VoiceType

    //const audioString = processedString(answer)
    const hashString = md5(answer)
    const voiceId = voice + "-" + hashString
    console.log(voiceId)
    const docRef = doc(db, "Voice", voiceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log()
      return NextResponse.json({ voiceId: voiceId, url: data.url, frame:data.frame, status:"0"});
    } else {
      try {
          const headers = {
              "Content-Type": "applicatiion/json",
              "Authorization": runpod_key
          }
          const data = {
              input: {
                  action: "/voice",
                  model_id: vits_param[voice]["model_id"],
                  text: answer
              }
          }
        const response = await axios.post(runpod_url, data, {headers:headers});
        return NextResponse.json({ voiceId: voiceId, audioContent: response.data.output.voice, status:"1"});
        } catch (error) {
            return NextResponse.json({ error: error });
        }
    }
}
