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


## API
Example usage:

``` typescript
import * as rimu from "https://raw.github.com/srackham/rimu-deno/master/src/rimu.ts";

console.log(rimu.render("Hello *Rimu*!"));
```

Save the above code as file `minimal-example.ts` then run it using:

    deno minimal-example.ts
    
See also Rimu
[API documentation](https://srackham.github.io/rimu/reference.html#api).


## CLI command
The [Rimu CLI
command](https://srackham.github.io/rimu/reference.html#rimuc-command) is
`rimuc.ts`.

Run it using e.g.

    deno --allow-env --allow-read https://raw.github.com/srackham/rimu-deno/master/src/rimuc.ts --help

**NOTE**: Include the `--allow-write` Deno option if you are writing an output file.


## Building
No explicit build setp is required, just import or run the TypeScript URL.


## Learn more about Rimu
Read the [documentation](https://srackham.github.io/rimu/reference.html) and
experiment with Rimu in the [Rimu
Playground](http://srackham.github.io/rimu/rimuplayground.html).


## Implementation
The Deno Rimu port is built using the TypeScript source code from the [canonical
Rimu implementation](https://github.com/srackham/rimu) with the following minor
modifications:

1. An explicit `.ts` extension was added to all TypeScript import and export statements
   (see the Makefile `update` task).
2. `rimuc.ts` was ported from the Node.js API to the Deno API.