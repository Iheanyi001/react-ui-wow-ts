import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'
import json from '@rollup/plugin-json';

import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
console.log(`running version ${packageJson.version}`);

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({tsconfig:"./tsconfig.json"}),
            json()
        ]
    },
    {
        input:"dist/esm/types/index.d.ts",
        output: [{file:"dist/index.d.ts", format:"esm"}],
        plugins: [dts()],
        external: [/\.css$/],
    }
]