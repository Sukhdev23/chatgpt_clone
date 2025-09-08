const {Pinecone} = require('@pinecone-database/pinecone')

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const CohortChatGptIndex = pc.Index("cohort-chatgpt");

// index create from Pinecone console

async function createMemory(vectors, messageId , metadata,) {
    // console.log("Creating memory:", { vectors, messageId, metadata });

 await CohortChatGptIndex.upsert([
  {
    id: messageId,
    values: vectors,
    metadata: metadata || {}
  }
]);

} 

async function queryMemory(vector, topK=5 ,metadata) {
  const result = await CohortChatGptIndex.query({
    vector:vector,
    topK:topK,
    filter:metadata ? metadata : undefined,
    includeMetadata: true
  });
  return result.matches
}
module.exports = {
  createMemory,
  queryMemory
}