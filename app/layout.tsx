import "./global.css";

export const metadata = {
  title: "StarGPT",
  description:
    "L'endroit pour poser toutes vos questions sur l'univers de StarWars",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
