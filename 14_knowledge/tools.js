export const TOOLS = [
    {
      type: "function",
      function: {
        name: "get_exchange_rate",
        description: "Get the exchange rate, info about currency",
        parameters: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              description: "The currency official code, for example EUR for Euro, USD for Dolar",
            }
          },
          required: ["currency"],
        },
      },
    },
    {
        type: "function",
        function: {
            name: "get_population",
            description: "Get current population of the country",
            parameters: {
                type: "object",
                properties: {
                    country: {
                        type: "string",
                        description: "Name of the country in english language, for exaple: poland, france."
                    }
                },
                required: ["country"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_general_answer",
            description: "Odpowiedz na tematy ogólne",
            parameters: {
                type: "object",
                properties: {
                    query: {
                      type: "string",
                      description: "Pytanie w niezmienionej formie",
                    }
                },
                required: ["query"]
            }
        }
    }
  ];