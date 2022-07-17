import { Provider, Subscribe as OriginalSubscribe } from "@react-rxjs/core";
import { createContext, ReactNode, Suspense, useContext } from "react";
import { Observable } from "rxjs";

const canUseDOM = !!(
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
);

export const SSRSubscriptionManager = createContext<
  (source: Observable<any>) => void
>(() => {
  throw new Error("SSRSubscriptionManager missing!");
});

export const Subscribe: React.FC<{
  children?: React.ReactNode | undefined;
  source$?: Observable<any>;
  fallback?: NonNullable<ReactNode> | null;
}> = canUseDOM
  ? OriginalSubscribe
  : ({ source$, children, fallback }) => {
      const manager = useContext(SSRSubscriptionManager);
      source$ && manager(source$);

      const actualChildren = <Provider value={manager}>{children}</Provider>;

      return fallback === undefined ? (
        actualChildren
      ) : (
        <Suspense fallback={fallback}>{actualChildren}</Suspense>
      );
    };
