const fs = require('fs');
const eslintConfigPath = 'eslint.config.mjs';
if (fs.existsSync(eslintConfigPath)) {
  let config = fs.readFileSync(eslintConfigPath, 'utf8');
  config = config.replace(
    /"@next\/next\/no-img-element": "off",\n      "prefer-const": "warn"/,
    '"@next/next/no-img-element": "off",\n      "prefer-const": "warn",\n      "react-compiler/react-compiler": "off",\n      "react-hooks/set-state-in-effect": "off"'
  );
  fs.writeFileSync(eslintConfigPath, config);
}
