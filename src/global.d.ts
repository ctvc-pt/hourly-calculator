declare global {
  interface Window {
    MathJax?: {
      Hub: {
        Config: (config: object) => void;
        Queue: (args: any[]) => void;
      };
    };
  }
}

export {};
