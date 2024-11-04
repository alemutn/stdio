# STDIO

Module to perform Input/Output operations similar to C-Style. ONLY for educational purposes.

## How to install

Run this in your command line:

```bash

npm install --save alemutn/stdio#master

```

## Example

Once installed...

### To create and write a file

```typescript

import CustomFileClass from "./file";
import path from "path";

const file: CustomFileClass = new CustomFileClass();

function writeFile() {
  file.open(path.resolve("prueba.txt"), "w");

  file.writeToFile("hola");
  file.writeToFile("mundo");

  file.close();
}

```

### To read a file

**Alternative 1**

```typescript
import CustomFileClass from "./file";
import path from "path";

const file: CustomFileClass = new CustomFileClass();

async function readFile() {
  file.open(path.resolve("prueba.txt"), "r");

  let i = 1;
  for await(const line of file.readLine()) {
    console.log(`#${i} - ${line}`);
    i++;
  }

}
```

**Alternative 2**

```typescript
import CustomFileClass from "./file";
import path from "path";

const file: CustomFileClass = new CustomFileClass();

async function readFile() {
  file.open(path.resolve("prueba.txt"), "r");

  let itLine = await file.readLine().next();
  while(!itLine.done) {
     const line = itLine.value; 
     console.log(`#${i} - ${line}`);
     i++;
     itLine = await file.readLine().next();
  }

}
  
```

