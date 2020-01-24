A port of the [Rimu Markup language](https://srackham.github.io/rimu/) to the
[Deno](https://deno.land/) runtime.

**CAUTION: This project is experimental. Deno is still under development and as
of writing has not reached 1.0.**

Tested with Deno 0.30.0


## Features
Functionally identical to the [JavaScript
implementation](https://github.com/srackham/rimu) version 11.1 with the
following exceptions:

- Does not support deprecated _Expression macro values_.
- Does not support deprecated _Imported Layouts_.


## Usage
Example usage:

``` typescript
import * as rimu from "./rimu.ts"

console.log(rimu.render("Hello *Rimu*!"));
```

See also Rimu
[API documentation](https://srackham.github.io/rimu/reference.html#api).


## CLI command
The [Rimu CLI
command](https://srackham.github.io/rimu/reference.html#rimuc-command) is
`rimuc.ts`.

Run it using e.g.

    echo 'Hello _World_!'| deno --allow-env --allow-read src/rimuc.ts


## Building
No explicit build required, just import and go.


## Learn more about Rimu
Read the [documentation](https://srackham.github.io/rimu/reference.html) and
experiment with Rimu in the [Rimu
Playground](http://srackham.github.io/rimu/rimuplayground.html).


## Implementation
The Deno port is built using TypeScript source code from the [canonical Rimu
implementation](https://github.com/srackham/rimu) with the following minor
modifications:

1. An explicit `.ts` extension was added to all TypeScript import and export statements
   (see the Makefile `update` task).
2. `rimuc.ts` was ported from the Node.js API to the Deno API.