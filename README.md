# [Kite](https://usekite.com)

![Kite Screenshot](https://dl.dropboxusercontent.com/u/3369256/screenshot.png)


## Table of Contents

 - [Development](#development)
 - [Bugs and Feature Requests](#bugs-and-feature-requests)
 - [Documentation](#documentation)
 - [Contributing](#contributing)
 - [Community](#community)
 - [Versioning](#versioning)
 - [Creators](#creators)
 - [Copyright and License](#copyright-and-license)


## Development

- Install the existing Kite bundle from [our webskite](https://usekite.com). This installs VirtualBox, docker and boot2docker locally and the current version of Kite.
- Install meteor.js `curl https://install.meteor.com/ | sh`.

### Running the develoment Server

- ./script/run.sh

### Building the Mac OS X Package

- ./script/bundle.sh  # Generates the app bundle under ./bundle
- ./script/dist.sh    # Generates the app under ./dist./osx/Kite.app
- ./script/package.sh # Generates a Kite.pkg installer under ./package

## Uninstalling

This will improve over time.

- Remove VirtualBox
- rm /usr/local/bin/boot2docker
- rm /usr/local/share/boot2docker-kite.iso
- rm /Applications/Kite.app

## Bugs and Feature Requests

Have a bug or a feature request? Please first read the [Issue Guidelines](https://github.com/usekite/kite-desktop/blob/master/CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/usekite/kite-desktop/issues/new).

## Documentation

Kite's documentation and other information can be found at [http://usekite.com/docs](http://usekite.com/docs).

## Contributing

Please read through our [Contributing Guidelines](https://github.com/usekite/kite-desktop/blob/master/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

Development [Roadmap](https://trello.com/b/xea5AHRk/kite-roadmap) can be found on our Trello board.

## Community

Keep track of development and community news.

- Follow [@usekite on Twitter](https://twitter.com/usekite).
- Check out Kite's [Roadmap](https://trello.com/b/xea5AHRk/kite-roadmap) on our Trello board.
- Read and subscribe to [The Official Kite Blog](https://usekite.com/blog).
- Chat with developers using Kite in our [HipChat room](http://www.hipchat.com/giAT9Fqb5).

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Kite is maintained under the [Semantic Versioning Guidelines](http://semver.org/). We'll try very hard adhere to those rules whenever possible.



## Creators

**Sean Li**

- <https://twitter.com/lisean106>
- <https://github.com/Elesant>

**Jeffrey Morgan**

- <https://twitter.com/jmorgan>
- <https://github.com/jeffdm>

**Michael Chiang**

- <https://twitter.com/mchiang0610>
- <https://github.com/mk101>



## Copyright and License

Code released under the [AGPL license](LICENSE).
