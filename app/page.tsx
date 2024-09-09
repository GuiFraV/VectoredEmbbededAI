"use client";

import Image from "next/image";
import starwarsGPTLogo from "./assets/logo2.webp";
import { useChat } from "ai/react";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import { Message } from "ai";
import Bubble from "./components/Bubble";
import { useState, useEffect } from "react";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const [response, setResponse] = useState<string | null>(null);

  const noMessages = !messages || messages.length === 0;

  const handlePrompt = (prompt) => {
    console.log(prompt);
    const msg: Message = {
      id: crypto.randomUUID(),
      content: prompt,
      role: "user",
    };
    append(msg);
    sendMessage(prompt);
  };

  const sendMessage = async (message) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ content: message }] }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response from server:", data);
      setResponse(data.answer || "No answer received");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (response) {
      const msg: Message = {
        id: crypto.randomUUID(),
        content: response,
        role: "assistant",
      };
      append(msg);
    }
  }, [response]);

  return (
    <main>
      <Image src={starwarsGPTLogo} height="75" alt="StarGPT Logo" />
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
              L'endroit pour les fans de Star Wars ! Demander ce que vous voulez
              sur le sujet ! Enjoy
            </p>
            <br />
            <PromptSuggestionRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
          sendMessage(input);
        }}
      >
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Posez moi une question"
        />
        <input type="submit" />
      </form>
    </main>
  );
};

export default Home;
