import { state, useStateObservable } from "@react-rxjs/core";
import { map, timer } from "rxjs";
import { Subscribe } from "./Subscribe";
// import { Subscribe } from "@react-rxjs/core";

export const App = () => (
  <div>
    <Subscribe fallback="Loading...">
      <SuspendedComponent />
    </Subscribe>
  </div>
);

const state$ = state(timer(3000).pipe(map(() => "World")));

function SuspendedComponent() {
  const value = useStateObservable(state$);

  return <div>Hello {value}!</div>;
}
