declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_GROQ_API_KEY: string;
      EXPO_PUBLIC_API_URL: string;
    }
  }
}

export {};