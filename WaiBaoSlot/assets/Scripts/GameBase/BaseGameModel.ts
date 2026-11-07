import { _decorator, Component, Node, assert } from 'cc';
const { ccclass, property } = _decorator;
import { ActionType, LevelConfig } from '../InterFace/LevelConfig';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { EventName } from '../Mgr/EventName';

/**
 * 调试：固定进场盘面（改这里就能直接看到设置的盘面）
 * 结构：reels[表][列][行]；关卡3/关卡5 都是 1张表 × 5列 × 3行，形状通用
 * 每列里第0个数字显示在最下面一行，依次往上排
 * id 必须存在于对应关卡的 Symbol 表：
 *   关卡3(LevelTR) 可用 0~10、90、92、93
 *   关卡5(LevelJT) 可用 0~10、90、92、94、95、96、100（没有93）
 * 设为 null 恢复使用服务器(default.json)数据
 */
const DEBUG_FIXED_REELS: number[][][] | null = [
    [
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3],
        [1, 3, 1],
    ],
];

export class BaseGameModel {
    public m_spinData: any = null;           // 当前spin的数据
    public m_levelConfig: any = null;
    public m_bet: number = 0;
    public m_betList: number[] = [];
    public m_action: string = "";
    public m_nextAction: string = "";
    public m_lastAction: string = "";
    public m_jackpots: number[] = [];
    public m_reelsData: number[][][] = null;
    public m_respinReelsData: number[][][] = null;
    public m_freeSpinReelsData: number[][][] = null;
    public m_respin: any = null;
    public m_freespin: any = null;
    public m_bonus: any = null
    public m_storedIcons: any = null;
    public m_lines: any = null;
    public m_winAmount: number = 0;
    public m_isAutoSpin: boolean = false;


    public parseEnterGameData(data: any): void {
        // console.log("=========> 开始解析进入关卡的数据");
        this.parseData(data);
        // 调试：固定盘面只覆盖进场数据，不影响 spin 结果
        if (DEBUG_FIXED_REELS) {
            this.m_reelsData = DEBUG_FIXED_REELS;
            console.warn("【调试盘面】进场盘面已被固定数组覆盖:", JSON.stringify(DEBUG_FIXED_REELS));
        }
    }

    public parseSpinData(spinData: any): void {
        // console.log("=========> 解析Spin关卡数据");
        this.m_spinData = spinData;
        this.parseData(spinData);
        this.noticeEventToView();
    }
    // 子类可能会重写
    public noticeEventToView(): void {
        GlEventMgr.Instance.emit(EventName.View_LevelSpin_responese);
    }

    public setLevelConfig(levelConfig: LevelConfig) {
        this.m_levelConfig = levelConfig;
    }

    public parseData(data: any): void {
        console.log(data, 'jsonData================');

        this.m_bet = data.bet;
        this.m_betList = data.betList;
        this.m_lastAction = data.lastAction;
        this.m_action = data.action;
        this.m_jackpots = data.jackpots;
        this.m_reelsData = data.reels;
        console.log(this.m_reelsData, 'm_reelsData================');

        this.m_respinReelsData = data.respinReels;
        this.m_freeSpinReelsData = data.freeSpinReels;
        this.m_respin = data.respin;
        this.m_freespin = data.freespin;
        this.m_bonus = data.bonus;
        this.m_lines = data.lines;
        this.m_winAmount = data.winAmount;
        this.m_nextAction = data.nextAction;
        this.m_storedIcons = this.parseStoredIcons(data.storedIcons)
    }

    public getBet(): number {
        return this.m_bet;
    }

    public getBetList(): number[] {
        return this.m_betList;
    }

    public getLastAction(): string {
        return this.m_lastAction;
    }

    public getAction(): string {
        return this.m_action;
    }

    public getNextAction(): string {
        return this.m_nextAction;
    }

    public getJackpots(): number[] {
        return this.m_jackpots;
    }

    public getReelData(): any {
        return this.m_reelsData;
    }

    public getReSpin(): any {
        return this.m_respin;
    }

    public getFreeSpinInfo(): any {
        return this.m_freespin;
    }

    public getBonus(): any {
        return this.m_bonus;
    }

    public getStoredIcons(): any {
        return this.m_storedIcons;
    }

    public getLines(): any {
        return this.m_lines;
    }

    public getWinAmount(): number {
        return this.m_winAmount;
    }

    public parseStoredIcons(storedIcons: any): any {
        let reelData = this.getSpinReelData();
        // 外层循环是轮盘
        for (const index in storedIcons) {
            if (reelData[index] != null) {
                for (const key in storedIcons[index]) {
                    let meta = storedIcons[index][key];
                    meta.id = reelData[index][meta.col][meta.row];
                }
            }
        }
        return storedIcons
    }

    // 获取轮盘数据
    public getSpinReelData(): number[][][] {
        if (this.m_action == ActionType.NORMAL) {
            return this.m_reelsData;
        }
        else if (this.m_action == ActionType.RESPIN) {
            return this.m_respinReelsData;
        }
        else if (this.m_action == ActionType.FREESPIN) {
            return this.m_freeSpinReelsData;
        }
        else {
            return this.m_reelsData;
        }
    }

    public getFreeSpinReelData(): number[][][] {
        return this.m_freeSpinReelsData;
    }

    public getRespinReelData(): number[][][] {
        return this.m_respinReelsData;
    }

    // 获取信号块id
    public getSymbolId(tableIndex: number, col: number, row: number): number {
        let spinReelData = this.getSpinReelData()
        return spinReelData[tableIndex][col][row]
    }

    public isAutoSpinStatus(): boolean {
        return this.m_isAutoSpin;
    }

    public setAutoSpinStatus(value: boolean): void {
        this.m_isAutoSpin = value;
    }

    public getLevelConfig(): LevelConfig {
        return this.m_levelConfig;
    }

    // bonus信号快上的数字
    public getStoredCoin(tableIndex: number, col: number, row: number) {
        assert(tableIndex !== null, " !! tableIndex is null !! ");
        assert(tableIndex !== null, " !! col is null !! ");
        assert(tableIndex !== null, " !! row is null !! ");
        let storedTableData = this.m_storedIcons[tableIndex];
        assert(storedTableData !== null, " !! storedTableData is null !! ");
        for (const value of storedTableData) {
            if (value.col == col && value.row == row) {
                return value
            }
        }
        assert(false, " !! 没有找到此数据 tableIndex = " + tableIndex + " and col = " + col + " row = " + row + "!! ");
    }
}


