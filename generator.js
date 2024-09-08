#!/bin/node
require("colors");
const fs = require("fs");
const args = require("yargs")
  .option("file", {
    alias: "f",
    demandOption: true,
    desc: "Wordlist with <firstname> <lastname> format",
  })
  .option("output", {
    alias: "o",
    demandOption: false,
    desc: "Output Path",
  })
  .check((f) => {
    // Verify if wordlist file exists
    if (!fs.existsSync(f.file)) {
      throw new Error("File does not exists");
    }
    // Verify if wordlist file has read access
    try {
      fs.accessSync(f.file, fs.constants.R_OK);
    } catch (e) {
      throw new Error("You don't have permission to read the provided file");
    }
    return true;
  }).argv;

let wordlist = fs.readFileSync(args.file).toString("utf-8").split("\n");
let output_wordlist = [];

const transformations = [
  (name, lastname) => `${name}${lastname}`, // JohnSmith
  (name, lastname) => `${name}.${lastname}`, // John.Smith
  (name, lastname) => `${name}.${lastname.slice(0, 1)}`, // John.S
  (name, lastname) => `${name.slice(0, 1)}.${lastname}`, // J.Smith
  (name, lastname) => `${name}_${lastname}`, // John_Smith
  (name, lastname) => `${name.slice(0, 1)}_${lastname}`, // J_Smith
  (name, lastname) => `${name}_${lastname.slice(0, 1)}`, // John_S
  (name, lastname) => `${name}-${lastname}`, // John-Smith
  (name, lastname) => `${name.slice(0, 1)}-${lastname}`, // J-Smith
  (name, lastname) => `${name}-${lastname.slice(0, 1)}`, // John-S
  (name, lastname) => `${name.charAt(0)}${lastname.charAt(0)}`, // JS
  (name, lastname) => `${name.charAt(0)}_${lastname.charAt(0)}`, // J_S
  (name, lastname) => `${name.charAt(0)}.${lastname.charAt(0)}`, // J.S
  (name, lastname) => `${name.charAt(0)}.${lastname.charAt(0)}`, // J-S
];

function applyTransformations() {
  wordlist = wordlist.filter((fullname) => {
    if (fullname.split(" ").length == 2) {
      return true;
    }
  });
  wordlist.forEach((e) => {
    const [firstname, lastname] = e.split(" ");
    transformations.forEach((t) => {
      output_wordlist.push(t(firstname, lastname));
    });
  });
}
function saveFile() {
  const bytes = Buffer.from(output_wordlist.join("\n"));
  if (args.output) {
    try {
      fs.writeFileSync(args.output, bytes);
      "\n[!]".blue + ` Wordlist saved in `.white + output.green + "\n";
    } catch (e) {
      if (e.code == "EACCES")
        console.error(`[X] You don't write permissions on ${args.output}`);
    }
  } else {
    const id = require("crypto").randomBytes(4).toString("hex");
    const output = `${process.cwd()}/users_${id}.txt`;
    fs.writeFileSync(output, bytes);
    console.log(
      "\n[!]".blue + ` Wordlist saved in `.white + output.green + "\n"
    );
  }
  console.log("Provided Wordlist lines: ".white + wordlist.length);
  console.log("Output Wordlist lines: ".white + output_wordlist.length);
}

applyTransformations();
saveFile();
