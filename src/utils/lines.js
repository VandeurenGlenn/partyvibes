export default params => {
  const store = {};
  let string = '';
  if (params === undefined) {
    params = {count: 6, substract: 0, width: 12, height: 3, substractHeight: 0};
  }
  let {count, substract, width, height, substractHeight} = params;
  if (count === undefined) count = 6;
  if (substract === undefined) substract = 0;
  if (substractHeight === undefined) substractHeight = 0;
  if (width === undefined) width = 12;
  if (height === undefined) height = 3;

  const updateTemplate = i => {
    const span = document.createElement('span');
    span.style.width = `${store.width}px`;
    span.style.height =  `${store.height}px`;
    span.style.backgroundColor = '#FFF';
    span.style.display = 'block';

    store.previousWidth = store.width;
    store.previousheight = store.height;

    if (i === 0) {
      string += span.outerHTML;
    } else {
      string += `<span class="flex"></span>${span.outerHTML}`;
    }
  };

  if (Array.isArray(count)) {
      for (const item of count) {
        const i = count.indexOf(item);
        width = item.width || width;
        if (substract && i > 0) {
          if (substract[i]) store.width = store.previousWidth - substract[i];
          else store.width = store.previousWidth - substract;
        } else {
          store.width = item.width || width;
        }
        if (substractHeight && i > 0) {
          if (substractHeight[i]) store.height =  store.previousheight - substractHeight[i];
          else store.height = store.previousHeight - substractHeight;
        } else {
          store.height = item.height || height;
        }
        updateTemplate(i)
      }
  } else {
    for (var i = 0; i < count; i++) {
      if (substract && i > 0) {
        if (substract[i]) store.width = store.previousWidth - substract[i];
        else store.width = store.previousWidth - substract;
      } else {
        store.width = width;
      }
      if (substractHeight && i > 0) {
        if (substractHeight[i]) store.height =  store.previousheight - substractHeight[i];
        else store.height = store.previousHeight - substractHeight;
      } else {
        store.height = height;
      }
      updateTemplate(i)
    }
  }
  return string
}
