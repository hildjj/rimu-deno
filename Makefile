# rimu-deno Makefile

# Set defaults (see http://clarkgrubb.com/makefile-style-guide#prologue)
MAKEFLAGS += --warn-undefined-variables
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := test
.DELETE_ON_ERROR:
.SUFFIXES:
.ONESHELL:
.SILENT:

SRC_FILES = mod.ts src/*.ts
RESOURCES_SRC = src/resources.ts
RESOURCE_FILES = src/resources/*

.PHONY: test
test: $(RESOURCES_SRC)
	# TODO
	echo 'Hello _World_!' | deno --allow-env --allow-read src/rimuc.ts | grep --silent '^<p>Hello <em>World</em>!</p>$$' -

.PHONY: update
update:
	# Fetch the latest Rimu source and add .ts extension to import and export statements for Deno.
	for f in $$(find ../rimu/src/rimu -type f -name '*.ts'); do
		sed -E "s/^((import|export).*from '.*)'/\1.ts'/" $$f > src/$$(basename $$f)
	done
	deno fmt $(SRC_FILES)

$(RESOURCES_SRC): $(RESOURCE_FILES)
	# Build resources.ts containing rimuc resource files.
	echo "Building resources $@"
	echo "// Generated automatically from resource files. Do not edit." > $@
	echo "export let resources: { [name: string]: string } = {" >> $@
	for f in $^; do
		echo -n "  '$$(basename $$f)': " >> $@
		data=$$(cat $$f)
		data=$${data//\\/\\x5C} # Escape backslash (unescaped at runtime).
		data=$${data//\`/\\x60} # Escape backticks (unescaped at runtime).
		echo "String.raw\`$$data\`," >> $@
	done
	echo "};" >> $@
	deno fmt $(RESOURCES_SRC)

.PHONY: tag
tag: test
	# Create Git version tag. VERS is a valid semantic version number.
	if [ -z $${VERS+x} ]; then
		echo "VERS environment variable not set e.g. make tag VERS=1.0.0"
		exit 1
	fi
	tag=v$(VERS)
	echo tag: $$tag
	git tag -a -m $$tag $$tag

.PHONY: install
install: test
	# Generate rimudeno executable wrapper for rimuc CLI.
	deno install rimudeno --allow-env --allow-read --allow-write ./src/rimuc.ts

.PHONY: push
push:
	git push -u --tags origin master
