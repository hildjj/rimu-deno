import { desc, env, glob, quote, run, sh, task } from "file:///home/srackham/local/projects/drake/mod.ts"

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

run();
