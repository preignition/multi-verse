// const path = require('path');
import node from 'rollup-plugin-node-resolve';
import ascii from "rollup-plugin-ascii";
import commonjs from "rollup-plugin-commonjs";
import license from "rollup-plugin-license";
import json from "rollup-plugin-json";
import {terser} from "rollup-plugin-terser";
import * as meta from "./package.json";

const name = 'universe';

const config = {
  input: `index-${name}.js`,

  output: {
    file: `build/${name}.js`,
    name: name,
    // exports: 'named',
    format: "umd",
    indent: true,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`
  },
  plugins: [
    node(),
    json(),
    // license({
    //  thirdParty: {
    //     output: path.join(__dirname, 'dependencies.txt'),
    //   }
    // }),
    // license({
    //   banner: `Copyright <%= moment().format('YYYY') %>`,
    // }),
    commonjs(),
    ascii()
  ]
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `build/${name}.min.js`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
];
