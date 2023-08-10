# Aldus Usage Manual

## What is this?

Aldus is a JavaScript library for automatic generation of data-driven, "report"-like PDF documents. Aldus is written in TypeScript,
runs on Node.js and builds upon LaTeX, EJS, SVG, and other technologies.

## AN IMPORTANT NOTE AT THE BEGINNING

Please note that Aldus is currently (as of 2023-08-10) still in a **very early stage of development**. While it is a complete "vertical prototype" and
generally usable as such, many features are still incomplete or missing. Also, Aldus is currently **not available on the npm registry yet**.

## Where does the name "Aldus" come from?

The name "Aldus" refers to the Venetian Renaissance printer and publisher *Aldus Pius Manutius*. The name was suggested by ChatGPT as a reference to an important historical person related to printing and publishing (and somebody other than Gutenberg, who already has a software library named after him ;)).

## What do I need to know to use Aldus?

Aldus uses document templates which are written as a mix of
LaTeX and JavaScript code. Thus, in order to create documents with
Aldus, you need at least basic understanding of how to use LaTeX and JavaScript.

In template files, LaTex and JavaScript code are brought together
with the EJS (Emebdded JavaScript) template syntax, so you'll also
need to know the basics of how to write EJS templates. However, the
basic ruleset of EJS is small and can be learned quickly and easily.

## How does Aldus work?

Aldus take a document template file (plus possibly additional asset files like images, SCSS style definitions, fonts etc.) and compiles it
into a PDF document, using various 3rd party open source 
tools like EJS, Inkscape and LaTeX.

Aldus performs this task in two distinct steps:

### Step 1: Compiling the EJS document template to intermediate files
In the first step, the EJS template engine compiles the document template file, which contains a mix of LaTeX and JavaScript code, into a pure LaTeX file which does not contain any JavaScript code or EJS control sequences any more. Basically, all JavaScript code sections of the original document template file are replaced by their output. The resulting file is called the "intermediate LaTeX file".

Typically, this step also involves the automatic creation of intermediate SVG files for dynamically generated, data-driven graphics (charts etc.). In step 2, these SVG files are converted to PDF and included in the final document.

### Step 2: Compiling intermediate files (and static assets) to PDF
In the second step, Aldus invokes the LaTeX compiler "xelatex" to compile the intermediate LaTeX file into the final resulting PDF file.

Typically, this step also involves calling Inkscape (a vector graphics editor) in non-interactive batch mode to compile intermediate SVG files generated in step 1 to PDF and insert them into the final document using the LaTeX "svg" package.


## What are the software requirements of Aldus?

### Operating System
First of all, we have developed and tested Aldus 
exclusively on recent versions of Ubuntu Linux (versions 20.04 and 22.04). So far, we have never tried to install and run it on any other
operation system. This means that we simply do not know exactly whether and
how it can be run on other OS. It is very likely that Aldus can
be run on other flavors of Linux rather easily, but at the moment we have no idea at all about e.g. Mac OS or Windows.

### Other Dependencies

In order to compile and run Aldus, you need the following
software packages installed on your system:

- Node.js (tested with version 18.16.0, minimal required version unknown)

- npm, the Node Package Manager

- The TypeScript compiler (tested with version 5.1.3, minimal required version unknown)

- The "xelatex" LaTeX to PDF compiler (usually provided by the "texlive-xetex" Ubuntu APT package)

- Inkscape (used by Aldus in non-interactive batch mode to compile SVG files to PDF files)

The following section provides detailed step-by-step instructions for how to install and run Aldus on Ubuntu Linux 22.04.

## Installation

The following installation instructions assume an existing Ubuntu 22.04 operating system environment. It also assumes that you have an existing
JavaScript or TypeScript project in the form of an npm package folder in which you want to use Aldus.



### Step 1: Installing required APT packages

Open a terminal and enter the following command:

`sudo apt install -y curl git inkscape texlive texlive-xetex`

Depending on additional LaTeX features which you might want to use to create your documents (for example, support
for languages other than English), you may have to
install additional TexLive packages. These are LaTeX/TexLive-related topics and can not be fully covered by this
manual. 

### Step 2: Installing the latest stable version of Node.js

Ubuntu 22.04 and older versions do not provide the most recent stable version of Node.js in their official APT repositories. 
To install the latest stable version of Node.js, we must register a 3rd party package source with the following bash command:


```curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -```

This command downloads a bash script to register a package source for the latest stable Node.js version and immediately runs the script.

Afterwards, we install Node.js from the newly registered source via APT:

`sudo apt -y install nodejs`



### Step 4: Install Aldus

NOTE: Currently (as of 2023-07-06), Aldus is not yet available on the public npm registry.

In order to use Aldus, you need to clone its GitHub repository and include the Aldus source files into your projects manually.


### Step 5: First Run

The installation of Aldus is now complete. Let's generate a test document to check whether it works.


### Step 6: Running Tests

Aldus uses the Mocha test framework for automated unit tests. 

Currently (as of 2023-08-09), only one very basic test is implemented. This test checks whether the general process of
generating a PDF file works. It creates a very simple PDF document and checks the existence of the file on the disk.

You can run the automated tests with the folling console command:

`npm run test`


## Additional Notes

Aldus was developed with the idea in mind that it could be integrated into a web service. Exposed to the world
wide web through a HTTP interface, Aldus could be used to generated "dynamic", parametrized documents on (HTTP) request. We have not yet implemented such a solution ourselves, but it should be possible to do with relatively few
simple steps. 