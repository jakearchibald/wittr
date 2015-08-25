var contextRange = document.createRange();
contextRange.setStart(document.body, 0);

export default function strToEls(str) {
  return contextRange.createContextualFragment(str);
}