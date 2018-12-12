export const processPositions = positions => {
    return positions.map(item => {
        return {
            ticker: item,
            securityType: "EQ",
            country: "IN",
            exchange: "NSE"
        };
    });
}