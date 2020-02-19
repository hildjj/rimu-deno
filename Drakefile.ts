import { abort, desc, env, execute, glob, quote, run, sh, task } from "file:///home/srackham/local/projects/drake/mod.ts"

env["--default-task"] = "test";
const SRC_FILES = glob("mod.ts", "src/*.ts");
const RESOURCES_SRC = "src/resources.ts";
const RESOURCE_FILES = glob("src/resources/*");

desc("Format source files");
task("fmt", [], async function() {
  await sh(`deno fmt ${quote(SRC_FILES)}`);
});

desc("Run tests");
task("test", [RESOURCES_SRC], async function() {
  await sh(`
    echo 'Hello _World_!' | deno --allow-env --allow-read src/rimuc.ts | grep --silent '^<p>Hello <em>World</em>!</p>$'
    `);
});

desc("Fetch the latest Rimu source and add .ts extension to import and export statements for Deno")
task("update",[], async function() {
  await sh(`
	for f in $(find ../rimu/src/rimu -type f -name '*.ts'); do
		sed -E "s/^((import|export).*from '.*)'/\\1.ts'/" $f > src/$(basename $f)
	done
	`);
  await execute("fmt")
});

desc("Build resources.ts containing rimuc resource files");
task(RESOURCES_SRC, RESOURCE_FILES, async function() {
  await sh(`
	echo "Building resources ${RESOURCES_SRC}"
	echo "// Generated automatically from resource files. Do not edit." > ${RESOURCES_SRC}
	echo "export let resources: { [name: string]: string } = {" >> ${RESOURCES_SRC}
	for f in ${quote(RESOURCE_FILES)}; do
		echo -n "  '$(basename $f)': " >> ${RESOURCES_SRC}
		data=$(cat $f)
		data=\${data//\\\\/\\\\x5C} # Escape backslash (unescaped at runtime).
		data=\${data//\\\`/\\\\x60} # Escape backticks (unescaped at runtime).
		echo "String.raw\\\`$data\\\`," >> ${RESOURCES_SRC}
	done
	echo "};" >> ${RESOURCES_SRC}
	deno fmt ${RESOURCES_SRC}
    `);
});

desc("Generate rimudeno executable wrapper for rimuc CLI")
task("install",["test"], async function() {
  await sh(`deno install -f --allow-env --allow-read --allow-write rimudeno ./src/rimuc.ts`);
});

desc("Create Git version tag. VERS is a valid semantic version number")
task("tag",["test"], async function() {
  if (!env.vers) {
	abort("'vers' variable not set e.g. drake tag vers=1.0.0")
  }
  if (!/^\d+\.\d+\.\d+/.test(env.vers as string)) {
	abort(`illegal semantic version number: ${env.vers}`)
  }
  const tag = `v${env.vers}`
  console.log(`tag: ${tag}`)
  await sh(`git tag -a -m ${tag} ${tag}`);
});

desc("Push changes to Github")
task("push",["test"], async function() {
  await sh(`git push -u --tags origin master`);
});

run();
