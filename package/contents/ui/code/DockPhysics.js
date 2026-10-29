/*
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Pure, frame-rate-independent dock motion and visual-slot layout helpers.
 * Positions are computed in one pass: no delegate size feeds back into zoom.
 */
function smooth(current, target, dt, tau) {
    if (!isFinite(current)) return target;
    const alpha = 1 - Math.exp(-Math.max(0, Math.min(dt, 0.05)) / Math.max(0.001, tau));
    return current + (target - current) * alpha;
}

// Semi-implicit Euler step; dt capped to avoid huge impulses after sleep.
function spring(position, velocity, target, dt, stiffness, damping) {
    const h = Math.min(0.035, Math.max(0, dt));
    const v = velocity + (stiffness * (target - position) - damping * velocity) * h;
    const p = position + v * h;
    return [p, v];
}

function orderForPreview(count, source, destination) {
    const order = [];
    for (let i = 0; i < count; ++i) order.push(i);
    if (source >= 0 && destination >= 0 && source < count && destination < count && source !== destination) {
        order.splice(destination, 0, order.splice(source, 1)[0]);
    }
    return order;
}

function layout(count, iconSize, spacing, separatorAt, separatorSpace,
                availableLength, mousePosition, progress, zoom, sigma,
                scaleCap, dragSource, dragTarget) {
    const order = orderForPreview(count, dragSource, dragTarget);
    const positions = new Array(count);
    const scales = new Array(count);
    const centers = new Array(count);
    const baseLength = count * iconSize + Math.max(0, count - 1) * spacing + separatorSpace;
    const baseStart = (availableLength - baseLength) / 2;
    let maximumScale = 1;

    // Evaluate every icon from one unchanging, regular base grid.
    for (let slot = 0; slot < count; ++slot) {
        const index = order[slot];
        const baseCenter = baseStart + slot * (iconSize + spacing)
            + iconSize / 2 + (separatorSpace > 0 && slot >= separatorAt ? separatorSpace : 0);
        const delta = mousePosition >= 0 ? baseCenter - mousePosition : Infinity;
        const gaussian = Math.abs(delta) < sigma * 4
            ? Math.exp(-delta * delta / (2 * sigma * sigma)) : 0;
        const targetScale = 1 + Math.max(0, zoom) * Math.max(0, Math.min(1.12, progress)) * gaussian;
        const scale = Math.min(Math.max(1, scaleCap), Math.max(1, targetScale));
        scales[index] = scale;
        maximumScale = Math.max(maximumScale, scale);
    }

    let visualLength = separatorSpace + Math.max(0, count - 1) * spacing;
    for (let i = 0; i < count; ++i) visualLength += iconSize * scales[i];
    const start = (availableLength - visualLength) / 2;
    let axis = start, separatorAxis = 0;
    for (let slot = 0; slot < count; ++slot) {
        if (slot === separatorAt && separatorSpace > 0) {
            separatorAxis = axis + separatorSpace / 2;
            axis += separatorSpace;
        }
        const index = order[slot], visualSize = iconSize * scales[index];
        // Task item stays iconSize wide; its scaled child is centered on this slot.
        centers[index] = axis + visualSize / 2;
        positions[index] = centers[index] - iconSize / 2;
        axis += visualSize + (slot < count - 1 ? spacing : 0);
    }
    return {positions, scales, centers, visualLength, maximumScale, separatorAxis, start, order};
}

function safeScale(requested, panelCrossSize, iconSize, reserve) {
    return Math.max(1, Math.min(requested,
        Math.max(1, (panelCrossSize - Math.max(0, reserve)) / Math.max(1, iconSize))));
}

function bounceDistance(panelCrossSize, iconSize, zoom, requestedFraction, reserve) {
    return Math.max(0, Math.min(iconSize * zoom * requestedFraction,
        panelCrossSize - iconSize * zoom - Math.max(0, reserve)));
}
