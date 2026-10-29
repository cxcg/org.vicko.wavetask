/*
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * Pure axis-aligned geometry used by WaveTask's list, task delegates and
 * backgrounds. No bindings to QML IDs: callers pass model/layout dimensions.
 */

// Length of unzoomed icons including normal gaps and the optional separator.
function baseLength(count, iconSize, spacing, separatorSpace) {
    return count * iconSize + Math.max(0, count - 1) * spacing + separatorSpace;
}

function contentLength(base, zoom, sigma, spacing) {
    return Math.ceil(base + zoom * sigma * Math.sqrt(2 * Math.PI) + spacing * 4);
}

function centerOffset(available, occupied) {
    return (available - occupied) / 2;
}

function crossAxisLength(iconSize, maxZoom, spacing) {
    return Math.ceil(iconSize * maxZoom + spacing * 4);
}

function separatorBoundary(count, launcherCount) {
    return Math.max(0, Math.min(count, launcherCount));
}

function separatorEnabled(count, boundary, enabled) {
    return enabled && boundary > 0 && boundary < count;
}

function itemLength(item, vertical, iconSize) {
    return item ? (vertical ? item.height : item.width) : iconSize;
}

// Sum the current (possibly zoomed) lengths, never counting the separator as a task.
function occupiedLength(repeater, vertical, iconSize, spacing, separatorSpace) {
    let total = separatorSpace;
    for (let i = 0; i < repeater.count; ++i) {
        total += itemLength(repeater.itemAt(i), vertical, iconSize);
        if (i > 0) total += spacing;
    }
    return total;
}

function itemPosition(repeater, index, vertical, iconSize, spacing,
                      start, boundary, separatorSpace) {
    let pos = start;
    for (let i = 0; i < index; ++i) {
        pos += itemLength(repeater.itemAt(i), vertical, iconSize) + spacing;
    }
    if (separatorSpace > 0 && index >= boundary) pos += separatorSpace;
    return pos;
}

function separatorPosition(repeater, boundary, vertical, iconSize,
                           spacing, separatorSpace, start) {
    if (boundary <= 0 || boundary >= repeater.count || separatorSpace <= 0) {
        return 0;
    }
    // Derive the separator position from the same positioning formula as tasks.
    const last = repeater.itemAt(boundary - 1);
    return itemPosition(repeater, boundary - 1, vertical, iconSize, spacing,
                        start, boundary, separatorSpace)
        + itemLength(last, vertical, iconSize) + spacing + separatorSpace / 2;
}

// Predict the unzoomed icon's mouse hit center without referencing live task
// widths, which would create a width -> zoomFactor -> width binding loop.
function baseIconCenter(index, count, iconSize, spacing, available,
                        boundary, separatorSpace) {
    const total = baseLength(count, iconSize, spacing, separatorSpace);
    const start = centerOffset(available, total);
    return start + index * (iconSize + spacing) + iconSize / 2
        + (separatorSpace > 0 && index >= boundary ? separatorSpace : 0);
}

function skinOverflow(containmentLength, crossLength) {
    return Math.max(0, containmentLength - crossLength);
}
