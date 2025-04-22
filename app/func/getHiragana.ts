export default async function GetHiragana(answer:string){
    const response = await fetch("/api/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
        body: JSON.stringify({ answer: answer}),
      });
    const read = await response.json()
    return read.hiragana
}