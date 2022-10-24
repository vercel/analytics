export const initQueue = (): void => {
  // initialise va until script is loaded
  if (window.va) return;

  window.va = function a(...params): void {
    (window.vaq = window.vaq || []).push(params);
  };
};
