import { createSignal } from "solid-js";
import "./Challenge.css";

export interface ChallengeProps {
  onInput?: (tag: string) => void;
  disabled?: boolean;
}

export function Challenge({ onInput, disabled }: ChallengeProps) {
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
          disabled={disabled}
          onInput={(e) => {
            setTag(e.target.value);
          }}
          onKeyPress={(e) => {
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
        disabled={disabled}
        onClick={() => {
          const t = tag();
          if (t.trim().length === 0) return;
          setTag("");
          onInput?.(t);
        }}
      />
    </div>
  );
}
