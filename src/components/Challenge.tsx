import { createSignal } from "solid-js";
import "./Challenge.css";

export interface ChallengeProps {
  onInput?: (tag: string) => void;
}

export function Challenge({ onInput }: ChallengeProps) {
  let submitButton!: HTMLInputElement;
  const [tag, setTag] = createSignal("");
  return (
    <div class="challenge">
      <div class="tag input-wrap" data-value={tag()}>
        <span>#</span>
        <input
          class="input"
          size="1"
          type="text"
          onInput={(e) => {
            setTag(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitButton.click();
          }}
          value={tag()}
        />
      </div>
      <input
        ref={submitButton}
        class="button"
        type="button"
        value="도전!"
        onClick={() => {
          onInput?.(tag());
          setTag("");
        }}
      />
    </div>
  );
}
