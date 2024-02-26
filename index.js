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
