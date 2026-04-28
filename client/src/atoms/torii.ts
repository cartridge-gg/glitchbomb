import type * as torii from "@dojoengine/torii-wasm";
import { atom } from "jotai";

export const toriiClientAtom = atom<torii.ToriiClient | null>(null);
