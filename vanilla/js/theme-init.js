/* Applies the saved/OS theme before first paint.
 *
 * Must run before the first render of #app, and must be an EXTERNAL classic
 * script: a Content-Security-Policy with `script-src 'self'` (no
 * 'unsafe-inline') silently blocks inline <script> blocks — including the
 * inline import map, which would break every `firebase/*` specifier and leave
 * the app stuck on the boot spinner with no error to read.
 */
(function () {
  try {
    var s = localStorage.getItem("school-theme");
    document.documentElement.dataset.theme =
      s || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  } catch (e) {
    // Safari private mode throws on localStorage access
    document.documentElement.dataset.theme = "dark";
  }
})();
