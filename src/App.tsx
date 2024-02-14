import { Show, createEffect, createResource, createSignal } from "solid-js";
import "./App.css";
import { Challenge } from "./components/Challenge";

type Tag = {
  key: string;
  displayNames: { language: string; name: string; short: string }[];
};

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[–\-_]/g, " ")
    .replace(/\s/g, "");
}

const modeName = {
  "sudden-death": "서든데스",
  infinite: "무한 모드",
  "three-out": "삼진아웃",
};

export function App() {
  const [tags] = createResource<Tag[]>(() =>
    fetch(new URL("/tags.json", location.href)).then((r) => r.json()),
  );
  const [ac, setAc] = createSignal<[string, string][]>([]);
  const [mode, setMode] = createSignal<keyof typeof modeName>("sudden-death");
  const [life, setLife] = createSignal<number>(3);
  const [first, setFirst] = createSignal<HTMLLIElement | null>(null);
  const [shake, setShake] = createSignal<Animation | null>(null);
  createEffect(() => {
    const li = first();
    if (!li) return;
    li.animate(
      [
        {
          opacity: 0,
          transform: "translateY(-0.5em)",
        },
        {
          opacity: 1,
        },
      ],
      100,
    );
  });
  createEffect(() => {
    mode();
    setAc([]);
    setFirst(null);
    setLife(3);
  });
  const [fail, setFail] = createSignal<boolean>(false);
  return (
    <>
      <header class="header">
        <span class="title">tagged-exact</span>
        <fieldset id="mode">
          {Object.entries(modeName).map(([key, value]) => (
            <label for={key}>
              <input
                id={key}
                type="radio"
                name="mode"
                value={key}
                checked={key === mode()}
                onClick={() => setMode(key as keyof typeof modeName)}
              />
              <span>{value}</span>
            </label>
          ))}
        </fieldset>
      </header>
      <Show when={tags()} fallback={<div class="loading">불러오는 중... </div>}>
        {(tags) => (
          <Challenge
            disabled={fail()}
            onInput={(tag) => {
              const matching = tags().find(
                ({ key, displayNames }) =>
                  normalizeName(tag) === normalizeName(key) ||
                  displayNames.some(
                    ({ name, short }) =>
                      normalizeName(name) === normalizeName(tag) ||
                      normalizeName(short) === normalizeName(tag),
                  ),
              );
              console.log(matching);
              if (
                matching &&
                ac().every(([_displayName, key]) => key !== matching.key)
              )
                setAc([
                  [
                    matching.displayNames.find(
                      ({ language }) => language === "ko",
                    )?.name ?? "",
                    matching.key,
                  ],
                  ...ac(),
                ]);
              else {
                shake()?.finish();
                const root = document.getElementById("root");
                if (root) {
                  setShake(
                    root.animate(
                      [
                        { transform: "translate(0, 0) rotate(0deg)" },
                        { transform: "translate(10px, 10px) rotate(2deg)" },
                        { transform: "translate(0, 0) rotate(0deg)" },
                        { transform: "translate(-10px, 10px) rotate(-2deg)" },
                        { transform: "translate(0, 0) rotate(0deg)" },
                      ],
                      {
                        iterations: 2,
                        duration: 150,
                      },
                    ),
                  );
                }
                if (mode() === "sudden-death") setFail(true);
                if (mode() === "three-out") {
                  if (life() === 1) setFail(true);
                  else setLife((life) => life - 1);
                }
              }
            }}
          />
        )}
      </Show>
      <div class="status">
        <Show when={mode() === "three-out"}>
          <div class="lives">
            {Array.from({ length: 3 }).map((_v, i) => (
              <img
                src="/heart.svg"
                alt="life"
                style={{ opacity: i < life() ? undefined : 0.5 }}
              />
            ))}
          </div>
        </Show>
        <header class="progress">
          <progress
            class="progress-bar"
            max={tags()?.length || 0}
            value={ac().length}
          />
          <div>
            {ac().length}/{tags()?.length || "?"}
          </div>
        </header>
        <ul class="tag-list">
          {ac().map(([displayName, key], index) => (
            <li ref={(li) => index === 0 && setFirst(li)} class="tag">
              <span>#{displayName}</span> <span class="tag-en">{key}</span>
            </li>
          ))}
        </ul>
      </div>
      <footer class="description">
        <p>&copy; 2024 kiwiyou all rights reserved.</p>
        <p>이 사이트는 solved.ac의 운영주체와 관련이 없습니다.</p>
      </footer>
      <Show when={fail()}>
        <div class="fail">
          <div class="fail-text">실패!</div>
          <div class="progress">
            <progress
              class="progress-bar"
              max={tags()?.length || 0}
              value={ac().length}
            />
            <div>
              {ac().length}/{tags()?.length || "?"}
            </div>
          </div>
          <div class="button-group">
            <input
              type="button"
              class="button"
              value="한 수 무르기"
              onClick={() => {
                setFail(false);
                setLife(1);
                shake()?.finish();
              }}
            />
            <input
              type="button"
              class="button"
              value="재시작"
              onClick={() => {
                setAc([]);
                setFirst(null);
                setFail(false);
                setLife(3);
                shake()?.finish();
              }}
            />
          </div>
        </div>
      </Show>
    </>
  );
}
