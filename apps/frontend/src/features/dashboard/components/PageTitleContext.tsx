import { createContext, useContext, useState, type ReactNode } from 'react';

interface IPageTitleContext {
  title: string | null;
  setTitle: (title: string | null) => void;
}

const PageTitleContext = createContext<IPageTitleContext>({ title: null, setTitle: () => {} });

/** Lets a page set the Topbar title without the shell re-mounting on navigation. */
export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>{children}</PageTitleContext.Provider>
  );
}

export function usePageTitleContext() {
  return useContext(PageTitleContext);
}
