# STDIO

Module to perform Input/Output operations similar to C-Style. ONLY for educational purposes.

## How to install

In your package.json add the project as a dependency.

```json

"dependencies": {
    "stdio": "https://github.com/ahm0/stdio.git"
}

```

## Example

Once installed...

### To create and write a file

```typescript

import File from "./file";
import path from "path";

const file: File = new File();

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
import File from "./file";
import path from "path";

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
import File from "./file";
import path from "path";

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

