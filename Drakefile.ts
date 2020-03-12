/**
 * rimu-deno drakefile.
 */

/*
import {
  abort,
  desc,
  env,
  execute,
  glob,
  log,
  quote,
  readFile,
  run,
  sh,
  shCapture,
  task,
  writeFile
} from "https://raw.github.com/srackham/drake/master/mod.ts";
*/
import {
  abort,
  desc,
  env,
  execute,
  glob,
  log,
  quote,
  readFile,
  run,
  sh,
  shCapture,
  task,
  writeFile
} from "file:///home/srackham/local/projects/drake/mod.ts";
import * as path from "https://deno.land/std@v0.35.0/path/mod.ts";
import {
  assertEquals
} from "https://deno.land/std@v0.35.0/testing/asserts.ts";
env["--default-task"] = "test";

const SRC_FILES = glob("mod.ts", "src/*.ts");
const RIMUC_TS = "src/rimuc.ts";
const RESOURCES_SRC = "src/resources.ts";
const RESOURCE_FILES = glob("src/resources/*");

desc("Format source files");
task("fmt", [], async function() {
  await sh(`deno fmt ${quote(["Drakefile.ts", ...SRC_FILES])}`);
});

desc("Run tests");
task("test", ["fmt", RESOURCES_SRC], async function() {
  const { output } = await shCapture(
    `deno --allow-env --allow-read "${RIMUC_TS}"`,
    { input: "Hello _World_!" }
  );
  assertEquals(output, "<p>Hello <em>World</em>!</p>");
});

desc(
  "Fetch the latest Rimu source and add .ts extension to import and export statements for Deno"
);
task("update", [], async function() {
  for (const f of glob("../rimu/src/rimu/*.ts")) {
    const text = readFile(f).replace(
      /^((import|export).*from '.*)'/gm,
      "$1.ts'"
    );
    writeFile(path.join("src", path.basename(f)), text);
  }
  await execute("fmt");
});

desc("Build resources.ts containing rimuc resource files");
task(RESOURCES_SRC, RESOURCE_FILES, async function() {
  log(`Building resources ${RESOURCES_SRC}`);
  let text = "// Generated automatically from resource files. Do not edit.\n";
  text += "export let resources: { [name: string]: string } = {";
  for (const f of RESOURCE_FILES) {
    text += `  '${path.basename(f)}': `;
    let data = readFile(f);
    data = data.replace(/\\/g, "\\x5C"); // Escape backslash (unescaped at runtime).
    data = data.replace(/`/g, "\\x60"); //  Escape backticks (unescaped at runtime).
    text += `String.raw\`${data}\`,\n`;
  }
  text += "};";
  writeFile(RESOURCES_SRC, text);
  await sh(`deno fmt "${RESOURCES_SRC}"`);
});

desc("Generate rimudeno executable wrapper for rimuc CLI");
task("install", ["test"], async function() {
  await sh(
    `deno install -f --allow-env --allow-read --allow-write rimudeno "${RIMUC_TS}"`
  );
});

desc(
  "Create Git version tag e.g. 'drake tag vers=1.0.0' creates tag 'v1.0.0'"
);
task("tag", ["test"], async function() {
  if (!env.vers) {
    abort("'vers' variable not set e.g. drake tag vers=1.0.0");
  }
  if (!/^\d+\.\d+\.\d+/.test(env.vers as string)) {
    abort(`illegal semantic version number: ${env.vers}`);
  }
  let match = readFile(RIMUC_TS).match(/^const VERSION = "(.+)"/m);
  if (!match) {
    abort(`missing 'vers' declaration in ${RIMUC_TS}`);
  }
  match = match as RegExpMatchArray;
  if (match[1] !== env.vers) {
    console.log(
      `WARNING: ${env.vers} does not match version ${match[1]} in ${RIMUC_TS}`
    );
  }
  const tag = `v${env.vers}`;
  console.log(`tag: ${tag}`);
  await sh(`git tag -a -m ${tag} ${tag}`);
});

desc("Push changes to Github");
task("push", ["test"], async function() {
  await sh(`git push -u --tags origin master`);
});

run();
