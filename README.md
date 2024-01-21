# Obsidian Text Mapper

This plugin renders hex maps in Obsidian. It is a Typescript port of [Text Mapper](https://alexschroeder.ch/cgit/text-mapper/about/) originally written in Perl by [Alex Schroeder](https://alexschroeder.ch/wiki/Text_Mapper).

<img width="698" alt="example" src="https://user-images.githubusercontent.com/179336/234148935-af9a25f5-7891-4923-a467-b68b19c2ccb7.png">

The original Text Mapper by Alex Schroeder is licensed under the [GNU Affero General Public License, Version 3](https://www.gnu.org/licenses/agpl-3.0.txt). The Gnomeyland icons by Gregory B. MacKenzie are licensed und the [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

### Notes and changes

-   This port does not include support for square grids, verticality, or the `include` command.
-   I have included the Gnomeyland Map Icons created by Gregory B. MacKenzie by default. No other icon set is supported.
-   Added support for "pointy top" hexes. To switch between modes, simply add `option horizontal` to your block.
-   Added support for links in labels. To add a link, use the following syntax: `link|label`. The link will be applied to the entire label.
-   Added the ability to swap even and odd positions. With flat top hexes, for a hex (_x_, _y_), (_x_+1, _y_) is to the to the southeast if _x_ is odd and to the northeast if _x_ is even. Adding `option swap-even-odd` will reverse this: (_x_+1, _y_) is to the to the southeast if _x_ is even and to the northeast if _x_ is odd. This swapped numbering scheme is compatible with maps like the one for [Wolves Upon the Coast](https://lukegearing.itch.io/wolves-upon-the-coast-grand-campaign).
-   Added support for very simple coordinate formatting. Use `option coordinates-format`.
    -   The formatter will replace `{X}` with the x value and `{Y}` with the Y value.
    -   EXAMPLE: To render (4, 5) as `04.05`, use `option coordinates-format {X}.{Y}`.
-   Namespaced all element IDs: HTML/SVG assumes that a DOM element `id` is unique. Prior to this change, we did not ensure unique IDs, which led to issues when there was more than one map in the same document.
    -   You can turn off namespacing by using `option global`.

I have used this with the output of the "Alpine" maps generated by the original Text Mapper. It takes a while to render very large maps, so be patient. But it works! Here's an example that was generated in Obsidian:

<img width="700" alt="Very Large Alpine Map" src="https://user-images.githubusercontent.com/179336/234148902-bd9b4abd-1b0e-49cc-b4b3-965e89769a8b.png">

### Additional Resources

-   Text Mapper: https://campaignwiki.org/text-mapper
-   Alex Schroeder's blog explaining how to use Text Mapper: https://alexschroeder.ch/wiki/Text_Mapper
-   Perl source for Text Mapper: https://alexschroeder.ch/cgit/text-mapper/

## Development

-   Clone this repo.
-   `npm i` or `yarn` to install dependencies
-   `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

This is paraphrasing information from Obsidian's documentation: [Community plugins](https://help.obsidian.md/Extending+Obsidian/Community+plugins) and [Build plugins](https://help.obsidian.md/Developers/Build+plugins).

-   Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/text-mapper/`.
    -   If you ran `npm run dev`, these will be in the root folder.
    -   i.e. `cp main.js styles.css manifest.json ~/Dropbox/Obsidian/.obsidian/plugins/text-mapper`
    -   You can get a prebuilt version [in the releases tab](https://github.com/modality/obsidian-text-mapper/releases)
-   In Obsidian, navigate to Preferences > Community plugins. Toggle `Text Mapper` on.

### Example

This is pulled from: https://campaignwiki.org/contrib/gnomeyland-example.txt

However, since Gnomeyland icons are included by default, the `include gnomeyland.txt` line is not required. The following block should produce output similar to this:

<img width="698" alt="example render" src="https://user-images.githubusercontent.com/179336/234148773-43a84647-9410-4175-a37c-f25bda6421de.png">

````
```text-mapper
0101 tree "tree"
0102 trees "trees"
0103 forest "forest"
0201 bush "bush"
0202 bushes "bushes"
0203 brushland "brushland"
0301 fir "fir"
0302 firs "firs"
0303 fir-forest "fir-forest"
0401 hill "hill"
0402 mountain "mountain"
0403 mountains "mountains"
0501 fir-hill "fir-hill"
0502 fir-mountain "fir-mountain"
0503 fir-mountains "fir-mountains"
0601 forest-hill "forest-hill"
0602 forest-mountain "forest-mountain"
0603 forest-mountains "forest-mountains"
0604 fields "fields"
0605 desert "desert"
0701 grass "grass"
0702 marsh "marsh"
0703 swamp "swamp"
0704 lake "lake"
0705 shrine "shrine"
0801 keep "keep"
0802 tower "tower"
0803 castle "castle"
0804 law "law"
0805 chaos "chaos"
0806 swamp2 "swamp2"
0901 thorp "thorp"
0902 village "village"
0903 town "town"
0904 large-town "large-town"
0905 city "city"
1001 dust "dust"
1002 light-soil "light-soil"
1003 soil "soil"
1004 dark-soil "dark-soil"
1005 sand "sand"
1006 rock "rock"

1101 light-green "light-green"
1102 green "green"
1103 dark-green "dark-green"
1104 blue-green "blue-green"
1105 water "water"
1106 ocean "ocean"
1201 light-grey "light-grey"
1202 grey "grey"
1203 dark-grey "dark-grey"
1204 poisoned "poisoned"
1205 zone "zone"

# trail example and larger label example
0106 dark-green fir-forest "Deep Forest" 30
0206 green bushes
0306 soil keep "The Keep"
0406 light-soil town "Safe Town"
0005-0506 trail "The Auld Trail" 30%

# larger label example
other <text x="100" y="1170" font-size="40pt">Small Example</text>
```
````
