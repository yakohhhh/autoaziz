declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    EMAIL_SERVICE: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
  }
}
declare module 'react-router-dom';

declare module 'react-router-dom' {
  export * from 'react-router-dom';
}

declare module 'react-router' {
  export * from 'react-router';
}
