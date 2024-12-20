// Issue: DropdownMenu `pointer-events: none` persists on the body after closing a dialog, freezing the UI.
// Fix: Manually reset `pointer-events` on the body when closing the dropdown.

export function removePointerEventsFromBody() {
  if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
  }
}