import ollama from 'ollama'

export default class Ollama {
  chat = {
    completions: {
      async create({ messages, model, stream }) {
        if (!model) throw new ErrorResponse('400 you must provide a model parameter', 400);
        if (!messages) throw new ErrorResponse("400 Missing required parameter: 'messages'", 400);

        const response = await ollama.chat({
          model: model,
          messages: messages,
          stream: stream,
        });

        if (stream) {
          return this.createStream(response);
        }

        return {
          choices: [response]
        };
      },
      async *createStream(response) {
        for await (const part of response) {
          yield part;
        }
      }
    }
  }
}
