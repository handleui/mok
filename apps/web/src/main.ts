import { Counter } from "@mok/ui/counter";
import { Header } from "@mok/ui/header";
import { setupCounter } from "@mok/ui/setup-counter";
import "./style.css";
import typescriptLogo from "/typescript.svg";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error('Missing root element "#app".');
}

app.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    ${Header({ title: "mok" })}
    <div class="card">
      ${Counter()}
    </div>
  </div>
`;

const counter = document.querySelector<HTMLButtonElement>("#counter");

if (!counter) {
  throw new Error('Missing counter element "#counter".');
}

setupCounter(counter);
