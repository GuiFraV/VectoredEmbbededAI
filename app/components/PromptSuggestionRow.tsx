import PromptSuggestion from "./PromptSuggestion";

const PromptSuggestionRow = ({ onPromptClick }) => {
  const prompts = [
    "Qui est Luke Skywalker",
    "Qu'est ce que Tatoïne ?",
    "Qui est Guillaume Franguiadakis ?",
  ];
  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, _index) => (
        <PromptSuggestion
          key={_index}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
