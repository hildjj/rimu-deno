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

RESOURCES_SRC = src/resources.ts
RESOURCE_FILES = src/resources/*

.PHONY: test
test: $(RESOURCES_SRC)
	# TODO
	echo 'Hello _World_!'| deno --allow-env --allow-read src/rimuc.ts

.PHONY: update
update:
	# Fetch the latest Rimu source and add .ts extension to import and export statements for Deno.
	for f in $$(find ../rimu/src/rimu -type f -name '*.ts'); do
		sed -E "s/^((import|export).*from '.*)'/\1.ts'/" $$f > src/$$(basename $$f)
	done

$(RESOURCES_SRC): $(RESOURCE_FILES)
	# Build resources.ts containing rimuc resource files.
	echo "Building resources $@"
	echo "// Generated automatically from resource files. Do not edit." > $@
	echo "export let resources: { [name: string]: string } = {" >> $@
	for f in $^; do
		echo -n "  '$$(basename $$f)': " >> $@
		data=$$(cat $$f)
		data=$${data//\`/\\x60}
		echo "String.raw\`$$data\`," >> $@
	done
	echo "};" >> $@

.PHONY: push
push:
	git push -u --tags origin master
