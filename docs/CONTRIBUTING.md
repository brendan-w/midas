## Contributing

We aspire to create a welcoming environment for collaboration on this project.
To that end, we follow the [18F Code of Conduct](https://github.com/18F/code-of-conduct/blob/master/code-of-conduct.md) and ask that all contributors do the same.

### Public domain

This project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0
dedication. By submitting a pull request, you are agreeing to comply
with this waiver of copyright interest.

## Communication

Anyone actively contributing or using Midas, should join our [Mailing List](https://groups.google.com/forum/#!forum/midascrowd).
We also have a public Slack chat room. If you're interested in following along with the development process or have questions, feel free to join us at http://chat.18f.gov/, and select "midas-public".

You should be using the master branch for most stable release, please review [release notes](https://github.com/18F/midas/releases) regularly. We do releases every week or two and send out notes.  We're generally using [semantic versioning](http://semver.org/), but we're pre-1.0, so API can change at any time. We use the minor version for changes where there are significant installation process changes or API changes or a database migration is needed.

If you want to keep up with the latest changes, we work in the "devel" branch.  If you are using devel, keep an eagle-eye on commits and/or join our daily standup.

Currently stand-ups are at 11a PT / 2p ET, but we may reschedule now and then, so here is our calendar of public meetings:  https://www.google.com/calendar/embed?src=gsa.gov_689f3n1dfi539lv0g5p7lvobdc%40group.calendar.google.com&ctz=America/Los_Angeles

Anyone interested in Midas is welcome to join standup, you can meet the team and we can figure out appropriate longer-format or offline follow-up if you have lots of questions.

We also have a [wiki](https://github.com/18F/midas/wiki) where we keep various development notes. If anything is confusing or your questions are not answered there, please shout out on the [mailing list](https://groups.google.com/forum/#!forum/midascrowd).

## Development Process

This project follows the [git flow](http://nvie.com/posts/a-successful-git-branching-model/) branching model of product development.

### Watch command

Use `npm run watch` to automatically regenerate the application after changing files. This command will also source a `.env` file as a bash script if it exists. Use this for setting up environment variables for your development environment, such as:

```sh
# New Relic settings
export NEW_RELIC_APP_NAME=midas-local-dev
export NEW_RELIC_LICENSE_KEY=18956ab3a4d8c772

# LinkedIn auth settings
export LINKEDIN_CLIENT_ID=77xinrs
export LINKEDIN_CLIENT_SECRET=11aw6wbHC
export LINKEDIN_CALLBACK_URL=http://localhost:1337/api/auth/callback/linkedin

# MyUSA auth settings
export MYUSA_CLIENT_ID=0a33d1c4df848fa1ec666068285e903
export MYUSA_CLIENT_SECRET=bc4b61e58a579efb8907f5d673cef9f34e
export MYUSA_CALLBACK_URL=http://localhost:1337/api/auth/callback/myusa
```

### Testing

To run all the tests:
```npm test```

For testing in Midas, we are using:
* [mocha](http://visionmedia.github.io/mocha/) test framework
* [chai](http://chaijs.com/) assertion library
* [request](https://github.com/mikeal/request) to make http calls for testing API endpoints

The following command will execute a single test file in the application context:
```NODE_ENV=test ./node_modules/.bin/mocha test/test.upstart.js test/api/sails/tag.test.js```


### Backbone

- [Midas Backbone Best Practices](https://github.com/Innovation-Toolkit/midas/wiki/Backbone-Best-Practices).  Some basic hints on development in Backbone for Midas.

### Secure templating

Since Midas accepts and displays user-generated content, take care to make sure that is it escaped before displaying it. Otherwise, users may enter potentially harmful JavaScript code.

Escape all content that doesn't need to render as HTML in the client template file with [HTML-escaped filters](http://underscorejs.org/#template) `<%- ... %>`.

Any content that does need to display HTML, such as the user's profile, should be escaped in the view with `_.escape(content)` or by passing markdown content through `marked()`, which will sanitize HTML by default. Also include [a comment](https://github.com/18F/midas/blob/devel/assets/js/backbone/apps/profiles/show/templates/profile_show_template.html#L148) about how the content has been escaped so we can easily audit the templates.

Note: server-side templates use [node-ejs](https://github.com/tj/ejs) instead of [underscore](http://underscorejs.org/#template) for templates. The syntax is very similar, but HTML-escaping is done by default with `<%= ... %>` with EJS instead of `<%- ... %>` like underscore.

### <a name="git-hooks"></a> Git Hooks

When working in the development environment, be sure to install the project specific git hooks.

     tools/git_hooks/create-sym-links

### <a name="code-style"></a> Code Style

Generally try to follow the [Google Javascript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).  Spaces should be used instead of tabs, and the tab width should be set to 2 spaces.  No spaces at the end of lines.

### <a name="commit-messages"></a> Commit Messages

Treat commit messages as an email message that describes what you changed and why.

The first line of the commit log must be treated as as an email
subject line.  It must be strictly no greater than 50 characters long.
The subject must stand on its own and not only make external
references such as to relevant bug numbers.

The second line must be blank.

The third line begins the body of the commit message (one or more
paragraphs) describing the details of the commit.  Paragraphs are each
separated by a blank line.  Paragraphs must be word wrapped to be no
longer than 76 characters.

The last part of the commit log should contain all "external
references", such as which issues were fixed.

### Database changes

The database schema is managed in this repository under `/tools/postgres/`. When
you first set up Midas and run `npm run init` the `init.sh` script sets up the database
with the latest schema. Each subsequent run of `init.sh` checks the database version
and runs migration scripts to update it if the database is out of data.

When making a database change, write a shell script that updates the database to
your desired schema. Save this shell script as `[version].sh` where `[version]`
is the new version of the schema. Migration scripts should be saved in
`/tools/postgres/migrate`. See scripts in that directory like `2.sh` for examples.

Then, export the updated schema:

```sh
pg_dump -h localhost -p 5432 -U midas -s midas > ./tools/postgres/schema/current.sql
```

The schema is also updated each time you run `make build`.

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.  Providing the following information will increase the
chances of your issue being dealt with quickly:

* **Overview of the issue** - if an error is being thrown a non-minified stack trace helps
* **Motivation for or Use Case** - explain why this is a bug for you
* **Midas Version(s)** - is it a regression?
* **Browsers and Operating System** - is this a problem with all browsers or only IE8?
* **Reproduce the error** - provide a live example, screenshot, and/or a unambiguous set of steps. The more the better.
* **Related issues** - has a similar issue been reported before?  Reference the related issues in the descrioption.
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit).  If you're requesting a feature, describe how the feature might work to resolve the user story.

### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/Innovation-Toolkit/midas/pulls) for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch

     ```shell
     git checkout -b my-fix-branch devel
     ```

* Create your patch, **including appropriate test cases**.
* Follow our [Code Style](#code-style).
* Run the full Midas test suite, including `make test` and `make demo`,
  and ensure that all tests pass.
* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit-messages) and passes our commit message presubmit hook
  `pre-commit` and `commit-msg` (see [git hooks](#git-hooks)). Adherence to the [commit message conventions](#commit-messages)
  is required to assist in generating release notes.

     ```shell
     git commit -a
     ```
  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Build your changes locally to ensure all the tests pass

    ```shell
    npm test
    ```

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `midas:devel`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the Midas test suite to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase devel -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the devel branch:

    ```shell
    git checkout devel -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your devel with the latest upstream version:

    ```shell
    git pull --ff upstream devel
    ```

### Reviewing Pull Requests

Except for critical, urgent or very small fixes, we try to leave pull requests open for most of the day or overnight if something comes in late in the day, so that multiple people have the chance to review/comment.  Anyone who reviews a pull request should leave a note to let others know that someone has looked at it.  For larger commits, we like to have a +1 from someone else on the core team and/or from other contributor(s).  Please note if you reviewed the code or tested locally -- a +1 by itself will typically be interpreted as your thinking its a good idea, but not having reviewed in detail.


