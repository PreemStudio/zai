# zai

![Badge Mascot](/banner.png)

Be sure to browse through the [changelog](CHANGELOG.md), [code of conduct](.github/CODE_OF_CONDUCT.md), [contribution guidelines](.github/CONTRIBUTING.md), [license](LICENSE), and [security policy](.github/SECURITY.md).

## Installation

```
npm install @basecodeoy/zai -g
```

## Usage

##### Initialize the configuration file

```bash
zai config init --github-token={token} --openapi-token={token}
```

##### Set a configuration key to a value

```bash
zai config set --key={key} --value={value}
```

##### Get a configuration value by key

```bash
zai config get --key={key}
```

##### Delete a configuration value by key

```bash
zai config unset --key={key}
```

##### Summarize unstaged or staged changes in a git repository

```bash
zai git commit --style={style} --only-staged={onlyStaged}
```

##### Summarize a GitHub pull request

```bash
zai git summarize pr --repo={org}/{repo} {--number=} {--state=open} {--style=changelog}
```

##### List all open PR's for selection

```bash
zai git summarize pr --repo=laravel/framework
```

##### List all closed PR's for selection

```bash
zai git summarize pr --repo=laravel/framework --state=closed
```

##### Summarize a specific PR by its number

```bash
zai git summarize pr --repo=laravel/framework --number=45943
```

##### Summarize a specific PR by its number responding in a "commit" style

```bash
zai git summarize pr --repo=laravel/framework --number=45943 --style=commit
```

##### Summarize a GitHub commit or range of commits

```bash
zai git summarize commit --repo={org}/{repo} {--sha=} {--base=} {--head=} {--style=changelog}
```

##### List recent commits to summarize

```bash
zai git summarize commit --repo=laravel/framework
```

##### List recent commits in a specific branch to summarize

```bash
zai git summarize commit --repo=laravel/framework --branch=10.x
```

##### Summarize a specific commit

```bash
zai git summarize commit --repo=laravel/framework {--sha=}
```

##### Summarize a specific commit responding in a "commit" style

```bash
zai git summarize commit --repo=laravel/framework {--sha=} --style=commit
```

##### Summarize a range of commits from the tagged version to `master`

```bash
zai git summarize commit --repo=laravel/framework --base=v10.0.1
```

##### Summarize a range of commits from the tagged version to another tagged version

```bash
zai git summarize commit --repo=laravel/framework --base=v10.0.1 --head=v10.0.2
```

##### Summarize a range of commits

```bash
zai git summarize commit --repo=laravel/framework --base={sha} --head={sha}
```

##### Summarize a range of commits (from the given commit to `master`

```bash
zai git summarize commit --repo=laravel/framework --base={sha}
```

##### Generate a test for a given file, type, language, framework, and syntax

```bash
zai test generate --file={path/to/file} --type={type} --language={language} --framework={framework} --syntax={syntax}
```

##### Generate a regular expression for a given subject and language

```bash
zai regex generate --subject={subject} --language={language}
```

##### Generate a cron expression for a given subject

```bash
zai cron generate --subject={subject}
```
