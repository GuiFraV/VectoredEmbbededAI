"use client";

import Image from "next/image";
import starwarsGPTLogo from "./assets/logo.png";

const Home = () => {
  return (
    <main>
      <Image src={starwarsGPTLogo} height="75" alt="StarGPT Logo" />
    </main>
  );
};

export default Home;
