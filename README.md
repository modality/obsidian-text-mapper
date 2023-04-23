# Text Mapper

This plugin renders hex maps in Obsidian.

It is based on [Text Mapper](https://alexschroeder.ch/cgit/text-mapper/about/) by Alex Schroeder.

### Development

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/text-mapper/`.
  - If you ran `npm run dev`, these will be in the root folder.
  - i.e. `cp main.js styles.css manifest.json ~/Dropbox/Obsidian/.obsidian/plugins/text-mapper`
- In Obsidian, navigate to Preferences > Community plugins. Toggle `Text Mapper` on.
