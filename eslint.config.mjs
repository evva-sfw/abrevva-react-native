import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from '@eslint/compat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/node_modules/", "**/lib/"],
}, ...fixupConfigRules(compat.extends("@react-native", "prettier")), {
    plugins: {
        "unused-imports": unusedImports,
        "simple-import-sort": simpleImportSort,
    },

    rules: {
        'react-native/sort-styles': 'off',
        'react-native/no-inline-styles': 'warn',
        "no-void": "off",
        "max-len": "off",
        "no-console": "off",
        "no-bitwise": "off",
        "no-underscore-dangle": "off",
        "id-blacklist": "off",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": ["warn"],
        "react/react-in-jsx-scope": "off",

        "prettier/prettier": ["error", {
            printWidth: 100,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: "all",
            useTabs: false,
        }],
    },
}];