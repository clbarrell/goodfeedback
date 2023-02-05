import { Configuration, OpenAIApi } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type Data = {
  feedback: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const feedback = req.body.feedback || "";
  if (feedback.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid feedback",
      },
    });
    return;
  }
  console.log("Running");
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(feedback),
      temperature: 0.62,
      max_tokens: 1000,
    });
    console.log("Response", completion.data.choices[0].text);
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(feedback: string) {
  return `Good customer feedback identifies a problem that the customer faces in their day to day use of the product, what type of user the feedback is from such as role or motivation, says why it impacts their work and hints at a broader theme. It might be an opportunity to do something better.

  Good customer feedback examples:
  - Lead developers want better insight into their build usage, to plan for overages
  - Developer experience teams want to setup templates in Buildkite so their own product teams can build faster
  - Customers who use their mobile phones for banking find paying bills tedious and the process of entering the details for each bill cumbersome, error prone and time consuming.
  
  'Needs improvement' customer feedback doesn't identify a problem the customer faces and mentions a solution that a customer requests. It might not clearly state which customer it is about.
  
  Needs improvement customer feeback examples:
  - Customer wants a button to do a CSV export on the dashboard page
  - Leader doesn't like how we display build logs, finds it difficult to use
  - Customers want to be able to pay bills using their smartphone camera
  
  Classify the following feedback as good or needs improvement and describe how the feedback could be improved. If more information is requried, suggest a question that could be asked to the customer.
  
  Your response should be in JSON format with four parameters 'category' ('good' or 'needs improvement'), 'included' (good aspects included in the given feedback), 'missing' (aspects missing from the given feedback: and 'description' (your assessment about the feedback).
  
  ${feedback}:`;
}
