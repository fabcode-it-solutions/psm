import { pgSequence } from "drizzle-orm/pg-core";

export const reportSequence = pgSequence("report_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  cycle: true,
  cache: 10,
  increment: 1,
});

export const partSequence = pgSequence("part_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  cycle: true,
  cache: 10,
  increment: 1,
});

export const listSequence = pgSequence("list_hash_id_seq", {
  startWith: 1,
  minValue: 1,
  cycle: true,
  cache: 10,
  increment: 1,
});
