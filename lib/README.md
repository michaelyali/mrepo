<div align="center">
  <h1>MREPO</h1>
</div>

<div align="center">
  <strong>Awesome TypeScript monorepository swiss knife</strong>
</div>

<br />

<div align="center">
  <a href="https://github.com/zMotivat0r/mrepo/actions/workflows/tests.yml">
      <img src="https://github.com/zMotivat0r/mrepo/actions/workflows/tests.yml/badge.svg" alt="Tests" />
  </a>
  <a href="https://github.com/zMotivat0r/mrepo/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/zMotivat0r/mrepo.svg" alt="License" />
  </a>
</div>

<div align="center">
  <sub>Built by 
  <a href="https://twitter.com/MichaelYali">@MichaelYali</a>
</div>

<br />

Mrepo makes it easy to create new TypeScript packages monorepository, generate new packages, build, test, link/unlink to try them locally, publish either to GitHub or NPM package registry.

## Features

<img align="right" src="https://github.com/zMotivat0r/mrepo/blob/943e1979038aabb94dd4a64f8acc9b232fab93a6/lib/img/demo.gif?raw=true" alt="Mrepo demo" width="420" />

- Generate TypeScript monorepository
- Package generator with references between other packages included, and sub-generators support
- Build, clean, link/unlink, release packages commnads
- Jest testing ready (unit, e2e, coverage commands included)
- Lint and format (eslint & prettier)
- Husky hooks ready (pre-commit hook included)
- Conventional commits and changelogs
- GitHub actions included (tests & release)
- Issues and Pull Request templates

## Install

```shell
$ npm i @zmotivat0r/mrepo -g
```

## Commands

- [mrepo new](#mrepo-new)
- [mrepo generate](#mrepo-generate)
- [mrepo build](#mrepo-build)
- [mrepo clean](#mrepo-clean)
- [mrepo test](#mrepo-test)
- [mrepo link](#mrepo-link)
- [mrepo unlink](#mrepo-unlink)
- [mrepo release](#mrepo-release)
  - [release flow](#release-flow)

### mrepo new

_Generate new TypeScript monorepository._

_Info:_

```shell
mrepo new|n [options] <name>

Arguments:
  name               Monorepo name

Options:
  -y, --yes          Skip prompts and use default options (default: false)
  --dry-run          Dry run (default: false)
  --skip-scripts     Skip post-generator scripts (default: false)
  --skip-git         Skip git init (default: false)
  --skip-git-commit  Skip git initial commit (default: false)
  --skip-install     Skip dependencies installation (default: false)
  -h, --help         display info
```

_Usage:_

```shell
$ mrepo new awesome-monorepo
$ mrepo new awesome-monorepo --yes --skip-git
```

### mrepo generate

_Generate new package, update root `tsconfig.json`, add references to other packages, if needed._

_Info:_

```shell
mrepo generate|g [options] [package]

Arguments:
  package                    Package name, optional

Options:
  -y, --yes                  Skip prompts and use default options (default: false)
  --dry-run                  Dry run (default: false)
  --depends-on <pacakges>    Depends on scope package(s), comma-separated
  --dependent-of <pacakges>  Dependent of scope package(s), comma-separated
  -h, --help                 display info
```

_Usage:_

```shell
$ mrepo generate
$ mrepo generate cool-new-package --yes
```

### mrepo build

_Build all packages or a specified one._

_Info:_

```shell
mrepo build|b [options] [package]

Arguments:
  package     Package name, optional

Options:
  -h, --help  display info
```

_Usage:_

```shell
$ mrepo build
$ mrepo build packageName
```

### mrepo clean

_Remove `lib` folder in all packages ot a specified one._

_Info:_

```shell
mrepo clean|c [options] [package]

Arguments:
  package     Package name, optional

Options:
  -h, --help  display info
```

_Usage:_

```shell
$ mrepo clean
$ mrepo clean packageName
```

### mrepo test

_Run tests using Jest for all packages or a specified one._

_Info:_

```shell
mrepo test|t [options] [package]

Arguments:
  package               Package name, optional

Options:
  -f, --folder <value>  Tests folder (default: "packages")
  -s, --suite <value>   Suite path to run
  -c, --config <value>  Jest config file (default: "jest.config.js")
  --coverage            Run with coverage (default: false)
  --verbose             Run verbose (default: false)
  -h, --help            display info
```

_Usage:_

```shell
$ mrepo test
$ mrepo test packageName --verbose
```

### mrepo link

_Exec `npm link` for all packages or a specified one._

_Info:_

```shell
mrepo link|l [options] [package]

Arguments:
  package     Package name, optional

Options:
  --build     Build before linking (default: false)
  -h, --help  display info
```

_Usage:_

```shell
$ mrepo link
$ mrepo link packageName --build
```

### mrepo unlink

_Exec `npm unlink` for all packages or a specified one._

_Info:_

```shell
mrepo unlink|u [options] [package]

Arguments:
  package     Package name, optional

Options:
  -h, --help  display info
```

_Usage:_

```shell
$ mrepo unlink
$ mrepo unlink packageName
```

### mrepo digest

_Install or create symlinks from mrepos to local target repositories._

_Info:_

```shell
mrepo digest|d [options] [from] [to]

Arguments:
  from                      Mrepo names from the digest config file, comma-separated (optional)
  to                        Target names from the digest config file, comma-separated (optional)

Options:
  -c, --config <value>      Config file name or path (optional) (default: "mrepo-digest.json")
  -m, --mode <value>        Digest mode. One of ln, install. (optional)
  -p, --packages <value>    Mrepo packages to digest, comma-separated (optional)
  --installVersion <value>  Install packages with version
  --quiet                   Run quietly (default: false)
  -h, --help  display info
```

_Usage:_

1. Create a config json (default name "mrepo-digest.json") and place it somewhere in your system.

_Example config:_

```json
{
  "paths": [
    {
      "name": "first",
      "path": "/some/path/to/first"
    },
    {
      "name": "second",
      "path": "/some/path/to/second"
    },
    {
      "name": "third",
      "path": "/some/path/to/third"
    }
  ],
  "mrepos": [
    {
      "name": "first",
      "defaultPackages": ["one-package", "another-cool-package"],
      "targets": [
        {
          "name": "second",
          "packages": ["awesome-package"]
        },
        {
          "name": "third"
        }
      ]
    },
    {
      "name": "second",
      "targets": [
        {
          "name": "third",
          "packages": ["from-second-package"],
          "noDefaultPackages": true,
          "mode": "install"
        }
      ]
    }
  ],
  "targets": [
    {
      "name": "second",
      "installExec": "yarn add -W"
    },
    {
      "name": "third",
      "installExec": "npm i"
    }
  ],
  "mode": "ln"
}
```

In this example `first` and `second` are both `mrepo` generated monorepositories, where `second` depends on `first` (e.g. one has only public packages, another has only private packages under the same npm scope) and the `third` is just another node project wich depends on packages from both those mrepos.

`mrepos.defaultPackages` and `mrepos.targets.packages` are merged (`mrepos.targets.noDefaultPackages` prevents using default packages) . Can be overridden by using `--packages` option.

`mode` and `mrepos.targets.mode` have two values: `ln` - create symbolic links for packages from mrepo, `install` - install packages. Can be overridden by using `--mode` option.

```shell
$ mrepo digest
$ mrepo digest -c another-config.json first third --mode install
```

### mrepo release

_Start release new version: bump package(s) version, generate changelog, git commit and push._

_Info:_

```shell
mrepo release|r [options] <semver>


Arguments:
  semver              Package version semver type. One of: patch, minor, major,
                        prepatch, preminor, premajor, prerelease, select

Options:
  --no-git-push       Skip git commit and push
  --no-changelog      Skip changelog generation
  --preid <value>     Prerelease identifier (default: "alpha")
  --dist-tag <value>  Dist tag when Lerna version is "independent" (default: "latest")
  --force-publish     Force packages release (default: false)
  -h, --help          display info
```

_Usage:_

```shell
$ mrepo release minor
$ mrepo release premajor --preid beta
```

### release flow

Mrepo comes with the `release` GitHub action wich supports `independent` and `common` packages versioning. Here is the default release flow:

1. A developer creates a branch with the name that starts with `release` (e.g. `release/my-new-package`).
2. Runs `mrepo release <semver> [options]`.
3. Creates a Pull Request.
4. When merged, the `release` GitHub action executes the following:
   - Install, build, test
   - Checks latest git tag, then creates a new tag
     - if versioning is `independent` then a tag will be incremented from the previous one (semver `minor` part)
     - if versioning is `common` then a tag will be created from common version
   - Creates GitHub release with newly created tag
   - Publishes packages to the registry
   - Notifies in the comment of a Pull Request when packages are being published

It's worth mentioning that all of the default commands, along with some others are already added to the `package.json` scripts section.

## Support

Any support is welcome. At least you can give it a star :star:

## License

[MIT](LICENSE)
