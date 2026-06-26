export const BADGES = {
    ROYAL_CUSTOMER: 'ROYAL CUSTOMER',
    HIGH_PERFORMER: 'HIGH PERFORMER',
    MOST_SOLD: 'MOST SOLD',
    MOST_RENTED: 'MOST RENTED',
};

const num = (value) => Number(value) || 0;

function pickTopId(items, getKey, scoreFn, tieFn = () => 0, minScore = 0) {
    if (!items?.length) return null;

    let bestId = null;
    let bestScore = -Infinity;
    let bestTie = -Infinity;

    items.forEach((item) => {
        const score = scoreFn(item);
        const tie = tieFn(item);
        if (score > bestScore || (score === bestScore && tie > bestTie)) {
            bestScore = score;
            bestTie = tie;
            bestId = getKey(item);
        }
    });

    return bestScore > minScore ? bestId : null;
}

export function getRoyalCustomerId(passengers) {
    return pickTopId(
        passengers,
        (p) => p.passengerId,
        (p) => num(p.totalTrips),
        (p) => num(p.rating)
    );
}

export function getHighPerformerId(drivers) {
    return pickTopId(
        drivers,
        (d) => d.driverId,
        (d) => num(d.totalTrips) * 10 + num(d.rating) * 5 + (d.verificationStatus === 'APPROVED' ? 2 : 0),
        (d) => num(d.rating)
    );
}

export function getMostRentedId(vehicles) {
    const rented = (vehicles || []).filter((v) => v.isAvailable === false);
    if (!rented.length) return null;

    return pickTopId(
        rented,
        (v) => v.id,
        () => 1,
        (v) => num(v.dailyRateWithoutDriver ?? v.dailyRate),
        1
    );
}

export function getMostSoldId(listings) {
    const sold = (listings || []).filter((l) => l.status === 'SOLD' && l.listingType === 'SELL');
    if (!sold.length) return null;

    return pickTopId(
        sold,
        (l) => l.id,
        () => 1,
        (l) => num(l.price),
        1
    );
}

export function badgeCell(itemKey, topKey, badgeLabel) {
    return itemKey && topKey && itemKey === topKey ? badgeLabel : '—';
}

export function withBadgeColumn(rows, badgeValues) {
    return rows.map((row, index) => [...row, badgeValues[index] || '—']);
}
