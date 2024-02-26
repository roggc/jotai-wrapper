import {
  atom,
  useAtom as jotaiUseAtom,
  useAtomValue as jotaiUseAtomValue,
  useSetAtom as jotaiUseSetAtom,
} from "jotai";

const fallbackAtom = atom();

export default function getAPIFromAtoms(atoms) {
  const atomsEntries = Object.entries(atoms);

  function useJotai(atomInput, jotaiHook) {
    if (typeof atomInput === "string") {
      const atomEntry = atomsEntries.find(([key]) => key === atomInput);
      if (atomEntry) {
        return jotaiHook(atomEntry[1]);
      }
      return jotaiHook(fallbackAtom);
    }
    return jotaiHook(atomInput ?? fallbackAtom);
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
    return fallbackAtom;
  }

  const selectAtom = (atomName, selector) => {
    return atom((get) => selector(get(getAtom(atomName))));
  };

  return { useAtom, useAtomValue, useSetAtom, getAtom, selectAtom };
}
