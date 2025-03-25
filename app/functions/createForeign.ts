import { ForeignAnswers } from "@/types"

export default async function createForeign(answer:string, languages:string[]){
    const foreignLang = languages.filter((lang) => lang !=="日本語")
    const translated:ForeignAnswers = {}
    translated[answer] = []
        for (const language of foreignLang){
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                body: JSON.stringify({ answer: answer, language:language}),
              });
      
            const lang = await response.json();
            //const key = answer + "-" + language
            translated[answer].push({[language]:lang.foreign})
        }
    return translated
}