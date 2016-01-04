# Mansion Maniac

## Build your own Manhattan Mansion!

This is a procedural maze/dungeon builder that uses blueprints from NYPL's [Apartment Houses of the Metropolis](http://digitalcollections.nypl.org/collections/apartment-houses-of-the-metropolis#/?tab=about) collection. Individual rooms were cut out from the images in the collection and manually annotated with the [room editor](#room-editor). This places every room in a square grid that then allows for the player's avatar to explore.

### [Play now!](http://publicdomain.nypl.org/mansion-maniac/)

![animated screen capture of game](/images/readme-animated.gif?raw=true)

Uses images from the [Apartment Houses of the Metropolis](http://digitalcollections.nypl.org/collections/apartment-houses-of-the-metropolis#/?tab=about) collection and [its supplement](http://digitalcollections.nypl.org/collections/supplement-to-apartment-houses-of-the-metropolis#/?tab=about), [made available by the New York Public Library](http://publicdomain.nypl.org) as [public domain material](https://en.wikipedia.org/wiki/Public_domain).

### Room editor

The player's avatar moves on a square grid, where each square can be one of three different tile types:

- floor (the player can occupy these tiles),
- wall (player cannot occupy these tiles),
- door (“portal” to another room, these can only be 1 square deep and at least 2 square wide).

![room grid example](/images/readme-tiles.jpg?raw=true)

Rooms are of two types: starting/root rooms (the first room displayed) and regular rooms. The root room is the “entrance” to the mansion and is based on what appears to be an entrance to the original mansion in the blueprint. As the player moves around a room and encounters a door, a random complementary room with a door the same tile size is placed in that location.

There's a very basic [room editor](http://publicdomain.nypl.org/mansion-maniac/editor.html) that lets you see how each room is built (use the left/right arrows to change room). The editor does a simple check to verify that all doors have at least one complementary door (e.g.: if there is a 3-square door on the right there needs to be at least one 3-square door on the left).

_Easter egg_: there is a “debug mode” in the game that shows the different tiles for the rooms and is accessible by tapping the `D` key.

If you're interested in procedural dungeons similar to this one or those used in videogames, here's [a nice write up on dungeon algorithms](http://www.futuredatalab.com/proceduraldungeon/).

### End game and saving

If there are no available doors to go through or if the player moves on an area where two rooms overlap (the algorithm does not check for overlap prevention) you will need to press `Restart` to create a new mansion. You can also `Save` the current mansion as a `PNG` file and download it.

### Other credits

Made with [CreateJS](http://createjs.com/) and [TypeScript](http://typescriptlang.org/).

The name of this project is inspired by the amazing [Maniac Mansion](https://en.wikipedia.org/wiki/Maniac_Mansion) videogame by Ron Gilbert and Gary Winnick.

### About the NYPL Public Domain Release

On January 6, 2016, The New York Public Library enhanced access to public domain items in Digital Collections so that everyone has the freedom to enjoy and reuse these materials in almost limitless ways. For all such items the Library now makes it possible to download the highest resolution images available directly from the Digital Collections website. 

That means more than 187,000 items free to use without restriction! But we know that 180K of anything is a lot to get your head around — so as a way to introduce you to these collections and inspire new works, NYPL Labs developed a suite of projects and tools to help you explore the vast collections and dive deep into specific ones. 

Go forth & reuse; apply for our Remix Residency; and let us know what you made with the #nyplpd hashtag. For more info, links to our projects and more, visit:

- [More about our public domain release](http://publicdomain.nypl.org)
- Remix Residency (coming soon)
- [Data & Tools](https://github.com/NYPL-publicdomain/data-and-utilities)
