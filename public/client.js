// I'm trying to keep the client side code as simple as possible.

// https://htmx.org/api/#trigger
// reload workouts when the page gets focus
let firstFocus = true;
addEventListener("focus", () => {
  // prevent double call on page load
  if (firstFocus) {
    firstFocus = false;
    return;
  }
  // htmx.trigger("#workout-table", "onFocus");
});
setTimeout(() => {
  firstFocus = false;
}, 10000);
