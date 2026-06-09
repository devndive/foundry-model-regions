import assert from "node:assert/strict";
import { test } from "node:test";
import { diffLines } from "./text-diff.js";

test("diffLines marks unchanged lines with a leading space", () => {
  assert.equal(diffLines("a\nb", "a\nb"), " a\n b");
});

test("diffLines shows removed and added lines", () => {
  const diff = diffLines("east\nwest", "east\nnorth");
  assert.equal(diff, " east\n-west\n+north");
});

test("diffLines treats an empty previous snapshot as all additions", () => {
  assert.equal(diffLines("", "one\ntwo"), "+one\n+two");
});

test("diffLines reports deletions when content is removed entirely", () => {
  assert.equal(diffLines("gone", ""), "-gone");
});
