<!-- markdownlint-disable MD013 MD041 -->
<p align="center">
  <a href="https://designerajayk.github.io/tw-animate">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://designerajayk.github.io/tw-animate/logo-dark.svg" />
      <img src="https://designerajayk.github.io/tw-animate/logo-light.svg" width="350" />
    </picture>
  </a>
  <br />
  <br />
  A configuration to use <a href="https://github.com/animate-css/animate.css">Animate.css</a> with
  <a href="https://github.com/tailwindlabs/tailwindcss">Tailwind CSS</a>.
  <br />
  <br />
  <a href="https://github.com/designerajayk/tw-animate/actions/workflows/ci.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/designerajayk/tw-animate/ci.yaml?branch=main&label=CI&logo=github&style=flat-square" />
  </a>
  <a href="https://npm.im/tw-animate">
    <img src="https://img.shields.io/npm/dm/tw-animate?logo=npm&style=flat-square" />
  </a>
  <a href="https://skypack.dev/view/tw-animate">
    <img src="https://img.shields.io/endpoint?url=https://gnsbjfpv4lik.runkit.sh?package=tw-animate" />
  </a>
  <a href="https://deps.dev/npm/tw-animate">
    <img src="https://img.shields.io/endpoint?url=https://ir741raqc767.runkit.sh?package=tw-animate" />
  </a>
  <br />
  <a href="https://github.com/animate-css/animate.css/releases/tag/v4.1.1">
    <img src="https://designerajayk.github.io/tw-animate/animate-css.svg" />
  </a>
  <a href="https://github.com/designerajayk/tw-animate/blob/main/LICENSE.md">
    <img src="https://designerajayk.github.io/tw-animate/license.svg" />
  </a>
  <a href="https://conventionalcommits.org">
    <img src="https://designerajayk.github.io/tw-animate/commits.svg" />
  </a>
</p>

---

## Documentation

[View documentation](https://designerajayk.github.io/tw-animate/)

## Installation

Please see the [full installation instructions](https://designerajayk.github.io/tw-animate/installation) for detailed steps and examples.

### Quick start with NPM

First, install the plugin via npm:

```sh
npm install tw-animate
```

## Import

Second, import it alongside Tailwind CSS in your CSS file:

```css
/* tailwind css v4.x */
@import "tailwindcss";
@import "tw-animate";
```

Or, if you are using **Tailwind CSS v3.x** or the legacy JavaScript configuration file, import the plugin like this:

```js
// tailwind.config.js
module.exports = {
  // ...
  plugins: [
    require('tw-animate')
  ],
}
```

## Credits

- [Animate.css](https://github.com/animate-css/animate.css) &ndash; for
  animation utilities & keyframes &ndash; used under
  [the MIT license](https://cdn.jsdelivr.net/npm/animate.css@4.1.1/LICENSE).
- [Transform.tools](https://github.com/ritz078/transform) &ndash; for converting
  Animate.css to JS &ndash; used under
  [the MIT license](https://github.com/ritz078/transform/blob/master/LICENSE).
- [animated-tailwindcss](https://www.npmjs.com/package/animated-tailwindcss) &ndash; fork this to use tailwind 4
  [the MIT license](https://www.npmjs.com/package/animated-tailwindcss).
