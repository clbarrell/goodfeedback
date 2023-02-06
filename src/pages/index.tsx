import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  List,
  ListItem,
  Stack,
  Text,
  Textarea,
  UnorderedList,
} from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

type FeedbackResponse = {
  category: string;
  included: string;
  missing: string;
  description: string;
};

export default function Home() {
  const input = useRef<HTMLTextAreaElement>(null);
  const [feedback, setFeedback] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [response, setResponse] = useState<FeedbackResponse | null>(null);
  const [waitingOnResponse, setwaitingOnResponse] = useState(false);

  const newID = Date.now().toString();
  const [browserID, setBrowserID] = useLocalStorage("browserID", newID);

  useEffect(() => {
    if (input.current != null) {
      input.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    // setResponse("");
    if (feedback == "") {
      window.alert("Enter some feedback first please");
    } else {
      setSubmittedFeedback(true);
      onSubmit();
    }
  };

  const handleReset = () => {
    setSubmittedFeedback(false);
    if (input.current != null) {
      input.current.focus();
    }
    setFeedback("");
  };

  async function onSubmit() {
    try {
      setwaitingOnResponse(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback: feedback, user: browserID }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      console.log(JSON.parse(data.result));
      setResponse(JSON.parse(data.result));
      setwaitingOnResponse(false);
    } catch (error: any) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setwaitingOnResponse(false);
      alert(error.message);
    }
  }

  const useExample = () => {
    setFeedback(
      "Lead architects want to understand how teams' average build completion time is trending over time"
    );
  };

  return (
    <>
      <Head>
        <title>Is this good product feedback?</title>
        <meta name="description" content="Is this good product feedback?" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container centerContent>
          <Stack
            my={[4, 6, 32]}
            ml={[0, 0, -12, -32]}
            spacing={6}
            wrap="wrap"
            w="100%"
          >
            <Heading hidden={submittedFeedback}>
              Is this good product feedback?
            </Heading>
            <Text hidden={submittedFeedback}>
              Show me your feedback from a customer and I&apos;ll tell you if it
              needs improvement to be useful.
            </Text>
            {submittedFeedback && response != null && (
              <FeedbackBreakdown feedback={response} />
            )}
            <Textarea
              ref={input}
              w={"full"}
              rows={5}
              resize="none"
              autoFocus
              placeholder="Enter the product feedback from a customer here"
              // color={submittedFeedback ? "gray.500" : "inherit"}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              bg="gray.700"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <Box>
              <Button
                onClick={handleSubmit}
                colorScheme="green"
                isLoading={waitingOnResponse}
                loadingText="Loading"
                disabled={feedback == ""}
              >
                Submit ↩️
              </Button>
              <Button onClick={handleReset} ml={4}>
                Reset
              </Button>
            </Box>
            {/* <Box>
              <Button variant={"link"}>What is good product feedback?</Button>
            </Box> */}
            <Box hidden={submittedFeedback}>
              <Button
                variant={"link"}
                color="gray.400"
                onClick={useExample}
                fontSize="sm"
              >
                Show me an example
              </Button>
            </Box>
            <Box display={["block", "none"]}>
              {" "}
              <Text color="gray.400" fontSize={"sm"}>
                Made by Chris Barrell
              </Text>{" "}
            </Box>
          </Stack>
        </Container>
      </main>
      <Footer />
    </>
  );
}

const FeedbackBreakdown = ({ feedback }: { feedback: FeedbackResponse }) => {
  return (
    <Stack>
      <Heading>
        {capitalise(feedback.category)}
        {feedback.category.includes("good") && (
          <Text as="span" ml="2">
            👍
          </Text>
        )}
      </Heading>
      <Text>{feedback.description}</Text>
      <Text fontWeight={"bold"} color="green.200">
        Included
      </Text>
      <Box>
        <UnorderedList>
          {feedback.included.split(",").map((m) => (
            <ListItem key={m}>{m}</ListItem>
          ))}
        </UnorderedList>
      </Box>
      <Text fontWeight={"bold"} color="orange.200">
        Missing
      </Text>
      <Box>
        <UnorderedList>
          {feedback.missing.split(",").map((m) => (
            <ListItem key={m}>{m}</ListItem>
          ))}
        </UnorderedList>
      </Box>
    </Stack>
  );
};

const capitalise = (s: string) => s && s[0].toUpperCase() + s.slice(1);

const Footer = () => {
  return (
    <Box
      position={"fixed"}
      bottom={0}
      left={0}
      right={0}
      w="100%"
      h={12}
      display={["none", "block"]}
    >
      <Container>
        <Text ml={[0, 0, -8, -32]} color="gray.400" fontSize={"sm"}>
          Made by Chris Barrell
        </Text>
      </Container>
    </Box>
  );
};
