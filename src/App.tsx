import { Show, createEffect, createResource, createSignal } from "solid-js";
import "./App.css";
import { Challenge } from "./components/Challenge";

type Tag = {
  key: string;
  displayNames: { lang: string; name: string }[];
};

export function App() {
  const [tags] = createResource<Tag[]>(() =>
    fetch(new URL("/tags.json", location.href)).then((r) => r.json()),
  );
  const [ac, setAc] = createSignal<[string, string][]>([]);
  const [first, setFirst] = createSignal<HTMLLIElement | null>(null);
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
  const [fail, setFail] = createSignal<boolean>(false);
  return (
    <>
      <header class="header">
        <span>tagged-ex.ac/t</span>
      </header>
      <Show when={tags()} fallback={<div class="loading">불러오는 중... </div>}>
        {(tags) => (
          <Challenge
            onInput={(tag) => {
              const matching = tags().find(
                ({ key, displayNames }) =>
                  tag === key ||
                  displayNames.some(
                    ({ name }) => name.replace(/–/g, "-") === tag,
                  ),
              );
              if (
                matching &&
                ac().every(([_displayName, key]) => key !== matching.key)
              )
                setAc((ac) => [
                  [
                    matching.displayNames.find(({ lang }) => lang === "ko")
                      ?.name ?? "",
                    matching.key,
                  ],
                  ...ac,
                ]);
              else setFail(true);
            }}
          />
        )}
      </Show>
      <div class="status">
        <header class="progress">
          {ac().length}/{tags()?.length || "?"}
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
          <input
            type="button"
            class="button"
            value="재시작"
            onClick={() => {
              setAc([]);
              setFirst(null);
              setFail(false);
            }}
          />
        </div>
      </Show>
    </>
  );
}
