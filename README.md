# [Kitematic](https://kitematic.com)

![Kitematic Screenshot](https://dl.dropboxusercontent.com/u/3369256/screenshot.png)


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

- Install the existing Kitematic bundle from [our website](https://kitematic.com). This installs VirtualBox, docker and boot2docker locally and the current version of Kitematic.
- Install meteor.js `curl https://install.meteor.com/ | sh`.

### Running the develoment Server

- ./script/run.sh

### Building the Mac OS X Package

- ./script/bundle.sh  # Generates the app bundle under ./bundle
- ./script/dist.sh    # Generates the app under ./dist./osx/Kitematic.app
- ./script/package.sh # Generates a Kitematic.pkg installer under ./package

## Uninstalling

This will improve over time.

- Remove VirtualBox
- rm /usr/local/bin/boot2docker
- rm /usr/local/share/boot2docker-kitematic.iso
- rm /Applications/Kitematic.app

## Bugs and Feature Requests

Have a bug or a feature request? Please first read the [Issue Guidelines](https://github.com/kitematic/kitematic/blob/master/CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/kitematic/kitematic/issues/new).

## Documentation

Kitematic's documentation and other information can be found at [http://kitematic.com/docs](http://kitematic.com/docs).

## Contributing

Please read through our [Contributing Guidelines](https://github.com/kitematic/kitematic/blob/master/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

Development [Roadmap](https://trello.com/b/xea5AHRk/kitematic-roadmap) can be found on our Trello board.

## Community

Keep track of development and community news.

- Follow [@kitematic on Twitter](https://twitter.com/kitematic).
- Check out Kitematic's [Roadmap](https://trello.com/b/xea5AHRk/kite-roadmap) on our Trello board.
- Read and subscribe to [The Official Kitematic Blog](https://kitematic.com/blog).
- Chat with developers using Kitematic in our [HipChat room](http://www.hipchat.com/giAT9Fqb5).

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Kitematic is maintained under the [Semantic Versioning Guidelines](http://semver.org/). We'll try very hard adhere to those rules whenever possible.



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
