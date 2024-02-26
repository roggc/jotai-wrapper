# jotai-wrapper

## Motivation

This library originates from the necessity to migrate a project with [react-context-slices](https://react-context-slices.github.io/) to [jotai](https://jotai.org/). react-context-slices and jotai share a similar API. In react-context-slices you use the `useSlice` hook, while in jotai you use the `useAtom`, `useSetAtom`, and `useAtomValue` hooks. In react-context-slices you define React Context or Redux slices, while in jotai you define atoms. So the migration from the first to the second is fairly simple. react-context-slices serves its purpose, but has a great amount of memory usage specially when using React Context slices.

## The API

jotai-wrapper it's really a very tiny and simple library. This is its source code:

```javascript
// index.js
import {
  atom,
  useAtom as jotaiUseAtom,
  useAtomValue as jotaiUseAtomValue,
  useSetAtom as jotaiUseSetAtom,
} from "jotai";
import { useMemo } from "react";

export default function getAPIFromAtoms(atoms) {
  const atomsEntries = Object.entries(atoms);

  function useJotai(atomInput, jotaiHook) {
    if (typeof atomInput === "string") {
      const atomEntry = atomsEntries.find(([key]) => key === atomInput);
      if (atomEntry) {
        return jotaiHook(atomEntry[1]);
      }
      return jotaiHook(useMemo(() => atom(), []));
    }
    if (typeof atomInput === "undefined") {
      return jotaiHook(useMemo(() => atom(), []));
    }
    return jotaiHook(atomInput);
  }

  function useAtom(atom) {
    return useJotai(atom, jotaiUseAtom);
  }

  function useAtomValue(atom) {
    return useJotai(atom, jotaiUseAtomValue);
  }

  function useSetAtom(atom) {
    return useJotai(atom, jotaiUseSetAtom);
  }

  function getAtom(atomName) {
    const atomEntry = atomsEntries.find(([key]) => key === atomName);
    if (atomEntry) {
      return atomEntry[1];
    }
    return atom();
  }

  const selectAtom = (atomName, selector) => {
    return atom((get) => selector(get(getAtom(atomName))));
  };

  return { useAtom, useAtomValue, useSetAtom, getAtom, selectAtom };
}
```

As you can see it default exports a function, `getAPIFromAtoms`, which returns an object with three hooks (`useAtom`, `useAtomValue`, and `useSetAtom`) and two functions (`getAtom`, and `selectAtom`).

So the way to use it is also similar to the way you use react-context-slices. In react-context-slices you define a `slices` file
and in jotai-wrapper you define an `atoms` file:

```javascript
// atoms.js
import { atom } from "jotai";
import getAPIFromAtoms from "jotai-wrapper";

export const { useAtom, useSetAtom, useAtomValue, getAtom, selectAtom } =
  getAPIFromAtoms({
    counter: atom(0),
    todos: atom([]),
    messagesLastFoundId: atom(-1),
    invitationsLastFoundId: atom(-1),
    // rest of atoms
  });
```

Then, in your react components, you use it like this:

```javascript
// counter.js
import {useAtom} from "./atoms";

export default function Counter(){
    const [counter,setCounter]=useAtom("counter");

    return <>
    <button onClick={()=>setCounter(c=>c+1)}>+</button>{counter}
    <>;
}
```

As in react-context-slices, where you use strings to refer to the slices, in jotai-wrapper you also use strings to refer to the atoms. This allows for dynamic referencing:

```javascript
// use-last-found-id.js
import { useSetAtom } from "./atoms";

export function useLastFountId({ prefix }) {
  const setLastFoundId = useSetAtom(`${prefix}LastFoundId`);
  // ...
}
```

The hook `useAtomValue` is the same as in jotai, but using a string to refer to the atom: `const counter = useAtomValue("counter")`;

The `getAtom` function returns the atom which the string refers to: `const counterAtom = getAtom("counter");`

Finally, the `selectAtom` function you use it like this:

```javascript
// todos.js
import { selectAtom } from "./atoms";
import { useMemo } from "react";

export default function Todos({ index, id }) {
  const todoAtIndex = useAtomValue(
    useMemo(() => selectAtom("todos", (todos) => todos[index]), [index])
  );
  const todoWithId = useAtomValue(
    useMemo(
      () =>
        selectAtom("todos", (todos) => todos.find((todo) => todo.id === id)),
      [id]
    )
  );
  //...
}
```

As you can see from the source code shown, this function (`selectAtom`) from jotai-wrapper it's different than the `selectAtom` from jotai. So if you want to use the `selectAtom` from jotai, you must do `import {selectAtom} from "jotai/utils"`.
