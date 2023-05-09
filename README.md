# HTML - in - JS

## The Perfect Site Generator

Programming a simple, static, website is trickier than it looks. The first version is usually quick and easy to write but every subsequent version gets harder and more brittle with each change.

The lessons we have learnt in programming - localise scope, reuse components, calculate values from data - all hit a brick wall when coding a raw websites.

The problem is that HTML/CSS is not a 'real' programming language and it is a struggle to get it to behave properly. In response to this problem the programming community quickly moved on from using raw HTML/CSS and created new ways of generating them instead.

We call these 'templates' and the way most of them  work is to create a **new** language structure that is some mix of HTML and supporting programming structures - loops, conditionals and so on.

Now these have been excellent solutions and have taken us far yet they all still suffer from two fundamental problems:
1. They are not 'real' programming languages and hence always lag behind in implementing the full power available to a 'proper' language.
    * For example, how would you include some package that you found that does really nice Tree-shaking?
    * Or embed a new syntax highlighter someone has made?
    * Or color the background of a card based on the sentiment of the text in it?
2. Developers need to learn this new language and so get the *worst* of both worlds
    - We need to learn a new language and all the little tricks it needs in order to get something non-standard done (hours of googling)
    - And what we’ve learned lacks much of the true power of any 'real' language like Javascript that we could have leaned instead.

So The Perfect Site Generator would - ideally - require
1. **No** new language or concepts to be learnt
2. Allow us to add to HTML/CSS loops, conditionals, functions, scoping - all the good stuff that we've discovered we like over these years.

And - with the advent of [ES6](https://www.ecma-international.org/ecma-262/6.0/index.html#sec-arrow-function-definitions) - this Magical Perfect Site Generation Option is now a reality!

![icon](./html-in-js.png)

## Just Use Javascript

In [ES6](https://www.ecma-international.org/ecma-262/6.0/index.html#sec-arrow-function-definitions) Javascript now provides [Template Strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) as part of it’s core language. While it is easy to overlook this addition to the language as a “just prettier syntax” [Template Strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) are pretty powerful things.

What is a template string? Well they are like ‘normal’ javascript strings except that they can contain placeholders. These are indicated by the dollar sign and curly braces (`${expression}`). So we can change this string:

```js
'hello there ' + name + '! Great to see you.'
```

to this

```js
`hello there ${name}! Great to see you.`
```

The power here comes when we realize that the `expression` is fully functional Javascript. That means we can call functions, include packages, do calculations, … - do everything we could do with the *full power of Javascript behind us*.

The best way to explain it's power is to provide examples and how-to’s so let’s do that next.

## HTML - in - JS for Dummies
(or a quick look at some examples)

### 1. Use a simple HTML template

```js
let index = `<!doctype html>
<html>
<head>
  <title>${title}</title>
</head>
<body>
  ${content()}
</body>
</html>`
write('index.html', index)

...

let title = 'Welcome to HTML - in - JS'

...

function content() {
  return `
<div class=container>
  <div class='col col-4'
    ${sidebar()}
  </div>
  <div class='col col-8'>
    ${maincontent()}
  </div>
</div>`
}
...
```

We can see how similar the content above looks like a “template language” but it’s just plain vanilla Javascript.

### 2. Use [Markdown](https://daringfireball.net/projects/markdown/syntax)

We all love [markdown](https://daringfireball.net/projects/markdown/syntax). It’s a wonderful way of writing text with _just enough_ symbols thrown in to make it pleasing to write and useful to generate.

So how would we use markdown if we wanted in our site? Simple, just write our content in markdown in some file

```md
# First Fig
My candle burns at both ends;
It will not last the night;
But ah, my foes, and oh, my friends --
It gives a lovely light!
*-- Edna St Vincent Millay*
```

Then use our [favorite markdown package](https://www.npmjs.com/package/markdown-it) to parse it and give us the content we need:

```js
function poem(file) {
  return md.render(read(file))
}
```

### 3. Loop over table data

This is a classic use case for templates - looping. But now, instead of having to learn a new syntax _we use javascript directly_.

```js
`<ul>
  ${data.map(item => `<li>${item}</li>`).join('')}
</ul>`
```

## Helper Functions
When generating HTML-from-JS there are a few operations that are commonly required - reading from disk, saving a file, parsing markdown, using a HTML template, and so on.

[Here](./index.js) we have some helper functions that support these common cases which can be used to quickstart your site development (or just as a starting point for anyone who is creating their own).

```js
/*  example use */
const helper = require('html-in-js')

function createSite() {
  helper.save(helper.md(helper.read('content.md)), 'index.html')
  ...
}
```

This is the list of helper functions available:

<table>
<thead>
<tr>
<th>Function</th>
<th>Description</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td>read</td>
<td>Read data from file</td>
<td><code>read('content.md')</code></td>
</tr>
<tr>
<td>lines</td>
<td>Split data into lines</td>
<td>Splitting data into lines is useful for processing/filtering and so on</td>
</tr>
<tr>
<td>save</td>
<td>Saves data into file</td>
<td><code>save(html, path)</code></td>
</tr>
<tr>
<td>copy</td>
<td>Copies file into deployment</td>
<td><code>copy(src, dst)</code></td>
</tr>
<tr>
<td>exec</td>
<td>Executes a command in the default shell (only pass in trusted commands!)</td>
<td><code>exec(cmd)</code>: returns <code>(err, {stdout,stderr,exitCode})</code> USE WITH CARE</td>
</tr>
<tr>
<td>md</td>
<td>Convert markdown into HTML</td>
<td><code>md('# Hello World!')</code></td>
</tr>
<tr>
<td>htmlboilerplate</td>
<td>Use <a href="https://html5boilerplate.com" rel="nofollow">HTML 5 Boilerplate</a></td>
<td><code>htmlboilerplate()</code> - returns the HTML boilerplate which can then be edited with <code>lines()</code> or <code>edit()</code> <br> <code>htmlboilerplate(location)</code> - saves all required files (jquery, normalize.css,etc) into <code>location</code> (you can update the webmanifest/css/js and save your own favicon and icon.png)</td>
</tr>
<tr>
<td>clean</td>
<td>Cleans/deletes the file/folder passed in</td>
<td>USE WITH CARE</td>
</tr>
<tr>
<td>edit</td>
<td>Can be used to edit a file</td>
<td><code>edit(line =&gt; if(line.match(/sidebar content/)) return sidebar_content())</code> <br> <code>edit(line =&gt; if(line.match/jquery/) return helper.DELETE)</code></td>
</tr>
<tr>
<td>findAll</td>
<td>Returns all files in a path recursively</td>
<td><code>findAll('assets','.js')</code> <br> <code>findAll('assets,'js') // Also works</code> <br> <code>findAll('assets') // Don't filter by extension</code></td>
</tr>
</tbody>
</table>

## Example Site

You can see an example of HTML-in-JS in action [here](./example-site/)

## Your Contribution Welcome

The preceeding examples should have given you a feel for how simple and elegant it is to use HTML-in-JS.

I encourage anyone who believes in html-in-js to contribute more examples and how-to’s to spur ideas and drive html-in-js's adoption.

Thanks.

