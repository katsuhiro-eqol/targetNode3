

export default async function createEmbedding(question:string, model:string){
    const response = await fetch("/api/embedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
        body: JSON.stringify({ input: question, model: model}),
      });
    const embedding = await response.json()
    return embedding.embedding
}