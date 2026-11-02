// LevelTR 测试数据
// 改为每次旋转随机生成盘面，不再依赖固定测试序列

/** 进入关卡的初始数据 */
export const LevelTR_DEFAULT_DATA: Record<string, any> = {
    "betList": [10000, 20000, 30000, 40000],
    "bet": 1000,
    "lastAction": "NORMAL",
    "action": "NORMAL",
    "nextAction": "NORMAL",
    "jackpots": [310689, 78466, 0, 0],
    "reels": [[[10, 10, 10], [93, 93, 93], [6, 7, 8], [9, 10, 0], [0, 0, 0]]],
    "storedIcons": [],
    "collect": { "collectCount": 0, "collectTotalCount": 20, "newCollect": [], "collectPosition": [] },
    "lines": [],
    "winAmount": 0
};

/** 手动指定盘面：填了对象就优先返回它，设为 null 则走随机生成 */
export const DEBUG_SPIN_DATA: Record<string, any> | null = {
    bet: 1000,
    betList: [10000, 20000, 50000, 1000000],
    action: "NORMAL",
    lastAction: "NORMAL",
    nextAction: "NORMAL",
    winAmount: 4000,
    lines: [
        [
            { id: 6, row: 1, col: 0 },
            { id: 6, row: 1, col: 1 },
            { id: 6, row: 1, col: 2 },
            { id: 6, row: 1, col: 3 },
            { id: 6, row: 1, col: 4 }
        ]
    ],
    // 每列 [最下面一行, 中间行, 最上面一行]
    reels: [[
        [1, 6, 1],
        [10, 6, 1],
        [92, 92, 92],
        [92, 92, 92],
        [0, 6, 1]
    ]],
    storedIcons: {},
    jackpots: [10000, 20000, 30000, 40000]
};

const COLS = 5;
const ROWS = 3;

/** scatter 图标 id */
const SCATTER_ID = 90;
/** wild 图标 id */
const WILD_IDS = [92, 93];

/** 普通图标权重池，重复次数越多出现概率越高 */
const COMMON_POOL = [
    0, 0, 0, 0,
    1, 1, 1, 1,
    2, 2, 2,
    3, 3, 3,
    4, 4, 4,
    5, 5, 6, 6,
    7, 7, 8, 8,
    9, 10
];

/** 普通图标单线赔率（相对下注额的百分比） */
const PAY_TABLE: Record<number, number> = {
    0: 30, 1: 30, 2: 40, 3: 50, 4: 60,
    5: 80, 6: 80, 7: 100, 8: 100, 9: 120, 10: 150
};

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 随机取一个图标 id：3% scatter，5% wild，其余普通图标 */
function randomSymbol(): number {
    const r = Math.random();
    if (r < 0.03) return SCATTER_ID;
    if (r < 0.08) return WILD_IDS[randomInt(0, WILD_IDS.length - 1)];
    return COMMON_POOL[randomInt(0, COMMON_POOL.length - 1)];
}

/**
 * 随机生成一次 spin 结果
 * @param bet 本次下注额
 * @param winRate 出现中奖线的概率，0 ~ 1
 * @param freeRate 出现免费转的概率，0 ~ 1
 */
export function createRandomSpinData(
    bet: number = 1000,
    winRate: number = 0.25,
    freeRate: number = 0.05
): Record<string, any> {

    // 如果手动指定了盘面，优先返回它（深拷贝，避免多次旋转共享同一个对象）
    if (DEBUG_SPIN_DATA) {
        return JSON.parse(JSON.stringify(DEBUG_SPIN_DATA));
    }

    // 1. 先随机铺满盘面
    const reels: number[][] = [];
    for (let c = 0; c < COLS; c++) {
        const col: number[] = [];
        for (let r = 0; r < ROWS; r++) {
            col.push(randomSymbol());
        }
        reels.push(col);
    }

    const lines: any[] = [];
    let winAmount = 0;
    let nextAction = "NORMAL";

    // 2. 按概率制造一条中奖线：同一行从第 0 列起连续 3~5 个相同图标
    if (Math.random() < winRate) {
        const row = randomInt(0, ROWS - 1);
        const id = COMMON_POOL[randomInt(0, COMMON_POOL.length - 1)];
        const count = randomInt(3, COLS);
        const line: any[] = [];
        for (let c = 0; c < count; c++) {
            reels[c][row] = id;
            line.push({ id: id, row: row, col: c });
        }
        lines.push(line);
        // 连续数量越多赢得越多
        winAmount = Math.floor(bet * PAY_TABLE[id] / 100) * count;
    }

    // 3. 按概率制造免费转：盘面上摆 3 个 scatter
    if (Math.random() < freeRate) {
        nextAction = "FREESPIN";
        let placed = 0;
        while (placed < 3) {
            const c = randomInt(0, COLS - 1);
            const r = randomInt(0, ROWS - 1);
            if (reels[c][r] !== SCATTER_ID) {
                reels[c][r] = SCATTER_ID;
                placed++;
            }
        }
    }

    return {
        bet: bet,
        betList: [10000, 20000, 50000, 1000000],
        action: "NORMAL",
        lastAction: "NORMAL",
        nextAction: nextAction,
        winAmount: winAmount,
        lines: lines,
        reels: [reels],
        storedIcons: {},
        jackpots: [10000, 20000, 30000, 40000]
    };
}
