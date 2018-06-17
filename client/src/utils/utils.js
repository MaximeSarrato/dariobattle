export const createElementFromHtml = htmlString => {
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div;
};
