export function getCaretPosition(editableDiv: HTMLElement) {
  let caretPos = 0,
    sel: Selection,
    range: Range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement('span');
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint('EndToEnd', range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

export function setCaretPosition(elem: HTMLElement, position: number) {
  var range = document.createRange();
  var sel = window.getSelection();

  range.setStart(elem.childNodes[0], position);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

