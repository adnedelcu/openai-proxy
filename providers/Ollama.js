import axios from 'axios';

export default class Ollama {
  chat = {
    completions: {
      async create({ messages, model, stream }) {
        if (!model) throw new ErrorResponse('400 you must provide a model parameter', 400);
        if (!messages) throw new ErrorResponse("400 Missing required parameter: 'messages'", 400);

        if (stream) {
          return this.createStream({ messages, model });
        }

        const response = await axios.post('http://localhost:11434/api/chat', {
          model,
          stream: false,
          messages
        })

        return {
          choices: [response.data],
        };
      },
      async *createStream({ messages, model }) {
        const response = await axios.post('http://localhost:11434/api/chat', {
          model,
          stream: true,
          messages
        }, {
          responseType: 'stream',
          adapter: 'fetch',
        });

        const reader = response.data.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const update = JSON.parse(line);
              yield update;
            } catch (error) {
              console.error('Error parsing update:', error);
            }
          }
        }
      }
    }
  }
}
