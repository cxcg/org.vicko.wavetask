// Standalone geometry regression checks: node tests/dock-geometry.test.cjs
// This file tests the pure QML JavaScript helper without a KDE runtime.
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const source = fs.readFileSync("package/contents/ui/code/DockGeometry.js", "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const g = sandbox;

const iconSize = 42;
const spacing = 6;
const separator = 22;
const count = 5;
const boundary = 3;
const repeater = {
    count,
    itemAt: i => ({width: iconSize, height: iconSize})
};

assert.equal(g.baseLength(count, iconSize, spacing, separator), 256);
assert.equal(g.baseLength(0, iconSize, spacing, 0), 0);
assert.equal(g.separatorBoundary(5, 8), 5);
assert.equal(g.separatorBoundary(5, -1), 0);
assert.equal(g.separatorEnabled(5, 3, true), true);
assert.equal(g.separatorEnabled(5, 0, true), false);
assert.equal(g.separatorEnabled(5, 5, true), false);
assert.equal(g.separatorEnabled(5, 3, false), false);

const occupied = g.occupiedLength(repeater, false, iconSize, spacing, separator);
assert.equal(occupied, 256);
const start = g.centerOffset(456, occupied);
assert.equal(start, 100);
assert.equal(g.itemPosition(repeater, 0, false, iconSize, spacing, start, boundary, separator), 100);
assert.equal(g.itemPosition(repeater, 2, false, iconSize, spacing, start, boundary, separator), 196);
assert.equal(g.itemPosition(repeater, 3, false, iconSize, spacing, start, boundary, separator), 266);
assert.equal(g.separatorPosition(repeater, boundary, false, iconSize, spacing, separator, start), 255);
assert.equal(g.separatorPosition(repeater, 0, false, iconSize, spacing, separator, start), 0);

assert.equal(g.baseIconCenter(0, count, iconSize, spacing, 456, boundary, separator), 121);
assert.equal(g.baseIconCenter(3, count, iconSize, spacing, 456, boundary, separator), 287);

const tall = {count: 2, itemAt: i => ({width: 42, height: i ? 55 : 50})};
assert.equal(g.occupiedLength(tall, true, iconSize, spacing, 0), 111);
assert.equal(g.itemPosition(tall, 1, true, iconSize, spacing, 10, 1, 0), 66);
assert.equal(g.crossAxisLength(42, 1.5, 6), 87);
assert.equal(g.skinOverflow(86, 70), 16);
assert.equal(g.skinOverflow(40, 70), 0);
console.log("dock-geometry: all assertions passed");
