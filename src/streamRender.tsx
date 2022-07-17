import { Response } from "express";
import {
  renderToString,
  renderToPipeableStream,
  PipeableStream,
} from "react-dom/server";
import { Observable, Subscription } from "rxjs";
import { App } from "./component";
import { SSRSubscriptionManager } from "./Subscribe";
import fs from "fs";
import { Writable } from "stream";

export function staticRender(url: string, res: Response) {
  res.send("<!DOCTYPE html>" + renderToString(<App />));
}

const TEMPLATE_TAG = "<!--{ REACT_SSR }-->";
function wrapHTMLTemplate(stream: PipeableStream, res: Response): Response {
  const template = fs.readFileSync("public/index.html", { encoding: "utf-8" });
  if (!template.includes(TEMPLATE_TAG)) {
    return stream.pipe(res);
  }
  const [head, tail] = template.split(TEMPLATE_TAG);

  res.write(head);

  stream.pipe(
    new Writable({
      write(this, chunk, encoding, callback) {
        res.write(chunk, encoding, callback);
      },
      final(this, callback) {
        res.write(tail);
        res.end(callback);
      },
    })
  );
  return res;
}

const ABORT_DELAY = 10000;
export default function streamRender(url: string, res: Response) {
  // The new wiring is a bit more involved.
  res.socket.on("error", (error) => {
    console.error("Fatal", error);
  });
  let didError = false;
  // const data = createServerData();

  const subscriptions = new Map<Observable<any>, Subscription>();
  const manageSubscription = (source$: Observable<any>) => {
    if (subscriptions.has(source$)) return;
    subscriptions.set(source$, source$.subscribe());
  };

  const stream = renderToPipeableStream(
    // <DataProvider data={data}>
    //   <App assets={assets} />
    // </DataProvider>,
    <SSRSubscriptionManager.Provider value={manageSubscription}>
      <App />
    </SSRSubscriptionManager.Provider>,
    {
      bootstrapScripts: ["/main.js"],
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-type", "text/html");
        wrapHTMLTemplate(stream, res).on("close", () => {
          for (let sub of subscriptions.values()) {
            sub.unsubscribe();
          }
        });
      },
      onError(x) {
        didError = true;
        console.error(x);
      },
    }
  );

  setTimeout(() => stream.abort(), ABORT_DELAY);
}
