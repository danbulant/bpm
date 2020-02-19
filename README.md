# bpm
 
Better package manager.

*BPM is **NOT** ready to use, please wait until using it in production until stable version is released*

Manages your packages more easily, is way faster than any other available package manager and most importanly, saves space for your projects.


## Why?

NPM *(node package manager)* and others always use folder `node_modules` in the projects directory. This is to always use the version the package specifies, but it also means that it uses much more space than it needs - even same versions are installed duplicately.

BPM on the other hand, stores all packages in one place and also saves a file to mention which projects are actively using the package. If all projects remove the dependency, then it's simply removed from the disk to save space.

This means, that it can save much space - some apps use same depndencies and same versions, so they will be merged.

## BPM create node_modules. Is it normal?

Yes! Because of how node works, BPM needs to create the directory, but instead of pasting the dependencies there, it creates a symlink pointing to the actual version.

## Commands

BPM is aimed to fully **replace** NPM, *but*, as of now, it cannot.

Currently supported and working commands are:

* `view` (alias get, info) - Gets information about current project or given package from NPM's registry
* `bin` - Shows installation path of BPM
* `ping` - Does HTTP ping to NPM's registry. Note this is different from NPM ping, so it cannot be compared.
* `init` - Creates a default `package.json` in current working directory.


## Hide package.json warnings

Use the flag `--supressChecking` or `-sch` for short.