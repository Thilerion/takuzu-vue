/* eslint-env node */

import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import tailwindConfig from './tailwind.config.js';

export default {
  plugins: [
    autoprefixer,
    tailwindcss(tailwindConfig)
  ]
}