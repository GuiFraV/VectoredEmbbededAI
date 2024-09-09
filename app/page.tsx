"use client";

import Image from "next/image";
import starwarsGPTLogo from "./assets/logo2.webp";
import { useChat } from "ai/react";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const noMessages = !messages || messages.length === 0;
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
            {/* <PromptQuggestionRow /> */}
          </>
        ) : (
          <>
            {/* {show the messages here} */}
            {/* <LoadingBubble/> */}
          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
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
