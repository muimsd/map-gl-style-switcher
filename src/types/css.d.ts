// CSS module type declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
