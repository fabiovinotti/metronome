export function html(textChunks) {
  const template = document.createElement('template');
  template.innerHTML = textChunks.join();
  return template;
}
