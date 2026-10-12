import { _decorator, assert, Component, Node, sys } from 'cc';
import { LevelMgr } from './LevelMgr';
import { PlayerMgr } from './PlayerMgr';
import { ActionType } from '../InterFace/LevelConfig';

const { ccclass, property } = _decorator;

type BetTuple = [number, number, number];
type LineSymbolMeta = {
    id: number;
    col: number;
    row: number;
};
type StoredIconMeta = {
    col: number;
    row: number;
    Multiple: number;
}

type OneLineMeta = LineSymbolMeta[];
type TableLineMeta = OneLineMeta[];

type freespinData = {
    freeSpinNewCount: number; // 新获得的免费旋转次数
    freeSpinsLeftCount: number; // 剩余的免费旋转次数
    freeSpinsTotalCount: number; // 免费旋转的总次数
}

type reSpinData = {
    reSpinsTotalCount: number; // respin的总次数
    reSpinCurCount: number; // 当前的respin次数
}


type JsonResult = {
    bet:number;// 当前的投注金额
    betList:number[];// 可选的投注金额列表
    jackpots:number[];// jackpot数据
    lastAction: string, // 上一个action
    action: string, // 当前的action
    nextAction: string, // 下一个action
    reels: number[][][], // 轮盘数据
    lines:TableLineMeta[], // 连线数据
    storedIcons:StoredIconMeta[][], // bonus数据
    freespin:freespinData, // 免费旋转数据
    freeSpinReels:number[][][], // 免费旋转的轮盘数据
    respin:reSpinData, // respin数据
    respinReels:number[][][], // respin的轮盘数据
    winAmount: number // 赢钱金额
}


@ccclass('CKGameCenter')
export class CKGameCenter extends Component {

    public static Instance:CKGameCenter = null;

    private m_action = ""; // 当前的action
    private m_nextAction = ""; // 下一个action
    private m_lastAction = ""; // 上一个action

    private reel1:number[] = [3,5,6,7,8,90,92,94,1,2,3,4,5,6,7,90,92,94,0,1,2,3,5,6,7,8,90,92,94,1,2,3,4,5,6,7,90,92,94,0];
    private reel2:number[] = [92,94,0,1,2,3,4,6,7,8,90,92,94,0,2,3,4,5,6,7,8,92,94,0,1,2,3,4,6,7,8,90,92,94,0,2,3,4,5,6];
    private reel3:number[] = [0,2,3,4,5,6,7,8,92,94,0,1,2,3,4,6,7,8,90,92,94,0,2,3,4,5,6,7,8,92,94,0,1,2,3,4,6,7,8,90];
    private reel4:number[] = [1,2,3,4,6,7,8,90,92,94,0,2,3,4,5,6,7,8,92,94,0,1,2,3,4,6,7,8,90,92,94,0,1,3,4,5,6,7,8,90];
    private reel5:number[] = [0,1,2,3,4,6,7,8,90,92,94,0,1,3,4,5,6,7,8,90,94,0,1,2,3,4,5,7,8,90,92,94,0,1,3,4,5,6,7,8];

    private freereel1:number[] = [3,5,6,7,8,1,2,3,4,5,6,7,0,1,2,3,5,6,7,8,1,2,3,4,5,6,7,0,0,2,5,8,6];
    private freereel2:number[] = [0,0,1,2,3,4,6,7,8,1,0,2,3,4,5,6,7,8,2,0,1,2,3,4,6,7,8,3,0,2,3,4,5,6];
    private freereel3:number[] = [0,2,3,4,5,6,7,8,8,0,1,2,3,4,6,7,8,0,0,2,3,4,5,6,7,8,6,0,1,2,3,4,6,7,8];
    private freereel4:number[] = [1,2,3,4,6,7,8,1,2,0,2,3,4,5,6,7,8,8,0,1,2,3,4,6,7,8,5,8,0,1,3,4,5,6,7,8,6];
    private freereel5:number[] = [0,1,2,3,4,6,7,8,6,8,0,1,3,4,5,6,7,8,6,0,1,2,3,4,5,7,8,5,3,0,1,3,4,5,6,7,8];

    private respinreel1:number[] = [1,2,2,3,4,5,6,7,8,94,0,1,2,3,4,5,6,7,8,94,0,1,1,2,3,4,5,6,7,8];
    private respinreel2:number[] = [0,1,2,3,4,5,5,6,7,8,94,0,1,2,3,4,5,6,7,8,94,0,1,2,3,4,4,5,6,7];
    private respinreel3:number[] = [94,0,1,2,3,4,5,6,7,8,94,0,1,2,2,3,4,5,6,7,8,94,0,1,2,3,4,5,6,7];
    private respinreel4:number[] = [7,8,94,0,1,2,3,4,5,6,7,8,94,0,1,2,2,3,4,5,6,7,8,94,0,1,2,3,4,5];
    private respinreel5:number[] = [2,3,4,5,6,7,8,94,0,1,2,3,4,5,6,7,8,94,0,1,1,2,3,4,5,6,7,8,94,0];

    private line_parten:number[][] = [
        [1,1,1,1,1],
        [2,2,2,2,2],
        [0,0,0,0,0],
        [2,1,0,1,2],
        [0,1,2,1,0],
        [1,2,2,2,1],
        [1,0,0,0,1],
        [2,2,1,0,0],
        [0,0,1,2,2],
        [1,2,1,2,1],
        [1,0,1,0,1],
        [2,1,1,1,0],
        [0,1,1,1,2],
        [1,1,2,1,0],
        [1,1,0,1,2],
        [2,1,2,1,2],
        [0,1,0,1,0],
        [2,2,0,2,2],
        [0,0,2,0,0],
        [1,2,0,2,1],
        [1,0,2,0,1],
        [2,0,2,0,2],
        [0,2,0,2,0],
        [2,0,0,0,2],
        [0,2,2,2,0],
        [2,0,1,0,2],
        [0,2,1,2,0],
        [1,1,0,1,1],
        [1,1,2,1,1],
        [2,0,2,1,1]
    ];
    

    private line_bet:Record<number, BetTuple> = {
        0: [40, 75, 150],
        1: [30, 50, 90],
        2: [20, 40, 75],
        3: [15, 50, 50],
        4: [15, 20, 50],
        5: [10, 15, 30],
        6: [10, 15, 30],
        7: [5, 10, 20],
        8: [5, 10, 20],
        92: [5, 10, 15]
    };

    private normalReel:number[][] = [this.reel1,this.reel2,this.reel3,this.reel4,this.reel5];
    private freeReel:number[][] = [this.freereel1,this.freereel2,this.freereel3,this.freereel4,this.freereel5];

    private paramRow      = 3          //-- 行数
    private paramCol      = 5          //-- 列数
    private bonusId       = 94         //-- bonusId
    private bounsId2      = 95         //-- bonusId2
    private scatterId     = 90         //-- scatterId
    private bonusMultiple = [0.5,1,1.5,2,3,4.5,5,8,10 ]; //--bonus要显示的倍数
    private wildId = 92;
    private freeSpinTotalCount = 10; // 免费旋转次数
    private freeSpinCurrentCount = 0; // 当前免费旋转次数
    private freeSpinTotalWinAmount = 0; // 免费旋转总赢得金额

    private reSpinsTotalCount = 3; // respin的总次数
    private reSpinCurCount = 0; // 当前respin次数
    private respinRowCount:number[] = [3,4,5,6,7]; // respin模式的行数配置

    private tempNormalReelData:number[][][] = []; // 临时的正常轮盘数据
    private tempStoreIconsData:StoredIconMeta[][] = []; // 临时的bonus数据

    private tempReSpinReelData:number[][][] = []; // 临时的respin轮盘数据

    protected onLoad(): void {
        if( CKGameCenter.Instance === null ){
            CKGameCenter.Instance = this;
        }
        else{
            this.destroy();
            return;
        }
    }
    
    start() {
        this.m_action = ActionType.NORMAL;
        this.m_nextAction = ActionType.NORMAL;
        this.m_lastAction = ActionType.NORMAL;
    }

    update(deltaTime: number) {
        
    }

    private random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    /* ================= 轮盘 ================= */
    private getReelColData(reel: number[]): number[] 
    {
        const start = this.random(0, reel.length - 1);
        const result: number[] = [];

        for (let i = 0; i < this.paramRow; i++) {
            let idx = start + i;
            if (idx >= reel.length) idx -= reel.length;
                result.push(reel[idx]);
        }
        return result;
    }

    private getMultiple(): number {
        return this.bonusMultiple[this.random(0, this.bonusMultiple.length - 1)];
    }

    // 方法1 强制进入freespin的情况下 生成一个Normal轮盘数据 满足至少3个scatter
    private createForceFreeSpinReelData(): number[][][] {
        let reels:number[][][] = [[]]; // 多轮盘的结构
        let reelsData:number[][] = reels[0]; // 填充第一个轮盘的数据
        for (let i = 0; i < this.paramCol; i++) {
            const reelData = this.getReelColData(this.freeReel[i]);
            reelsData.push(reelData);
        }
        // 随机找出要生成scatter的3列位置 列的位置不能重复
        let scatterMapCol = new Map<number,boolean>();
        while (scatterMapCol.size < 3) {
            let col = this.random(0, this.paramCol - 1);
            if (!scatterMapCol.has(col)) {
                scatterMapCol.set(col, true);
            }
        }
        // 在这3列的随机位置上生成scatter
        for (const col of scatterMapCol.keys()) {
            const row = this.random(0, this.paramRow - 1);
            reelsData[col][row] = this.scatterId;
        }
        return reels;
    }
    // 方法2 生成连线数据
    private getReelsLines(reelsData: number[][]):TableLineMeta[] {
        let lines:TableLineMeta[] = [];

        let tableLine:TableLineMeta = [];

        for (const line of this.line_parten) {
            const tempLineSymbol: OneLineMeta = [];
            let one_line:OneLineMeta = [];

            for (let col = 0; col < this.paramCol; col++) {
                const row = line[col];
                let symbolId = reelsData[col][row];
                assert( symbolId != null," !! symbolId is null !! col = " + col + " row = " + row + " !! " );

                let meta:LineSymbolMeta = {} as LineSymbolMeta;
                meta.id = symbolId;
                meta.col = col;
                meta.row = row;

                tempLineSymbol.push( meta );
            }

            let orgId = -1;
            for (const s of tempLineSymbol) {
                if (s.id !== this.wildId) {
                    orgId = s.id;
                    break;
                }
            }

            if (orgId === this.bonusId || orgId === this.scatterId) {
                // -- bonus和scatter不参与连线
            }else{
                if (orgId === -1) {
                    // -- 全是wild
                    // tableLine.push(tempLineSymbol);
                    for( let i = 0; i < this.paramCol; i++ ){
                        let meta:LineSymbolMeta = {} as LineSymbolMeta;
                        meta.id = tempLineSymbol[i].id;
                        meta.col = tempLineSymbol[i].col;
                        meta.row = tempLineSymbol[i].row;
                        one_line.push( meta );
                    }
                    tableLine.push(one_line);
                }
                else{
                    // -- 检查是否满足
                    let isOk1 = false;
                    let isOk2 = false;
                    let isOk3 = false;
                    let isOk4 = false;
                    let isOk5 = false;
                    let lianNum = 0;
                    // -- 第一行
                    if ((tempLineSymbol[0].id == orgId) || ( tempLineSymbol[0].id == this.wildId )){
                        isOk1 = true;
                    }
                    // 第二行
                    if( isOk1 ){
                        if ((tempLineSymbol[1].id == orgId) || ( tempLineSymbol[1].id == this.wildId )){
                            isOk2 = true;
                        } 
                    }
                    // 三连
                    if( isOk2 ){
                        if ((tempLineSymbol[2].id == orgId) || ( tempLineSymbol[2].id == this.wildId )){
                            isOk3 = true;
                            lianNum = 3;
                        }
                    }
                    // 四连
                    if( isOk3 ){
                        if ((tempLineSymbol[3].id == orgId) || ( tempLineSymbol[3].id == this.wildId )){
                            isOk4 = true;
                            lianNum = 4;
                        }
                    }
                    // 五连
                    if( isOk4 ){
                        if ((tempLineSymbol[4].id == orgId) || ( tempLineSymbol[4].id == this.wildId )){
                            isOk5 = true;
                            lianNum = 5;
                        }
                    }

                    if( lianNum > 0 ){
                        for( let i = 0; i < lianNum; i++ ){
                            let meta:LineSymbolMeta = {} as LineSymbolMeta;
                            meta.id = tempLineSymbol[i].id;
                            meta.col = tempLineSymbol[i].col;
                            meta.row = tempLineSymbol[i].row;
                            one_line.push( meta );
                        }
                        let isSameLineExists = this.checkLineExists( tableLine, one_line );
                        if( !isSameLineExists ){
                            tableLine.push(one_line);
                        }
                    }
                }
            }
        }

        lines[0] = tableLine;
        return lines;
    }
    // 方法3 生成storedIcons数据
    private getStoredIcons(reelsData: number[][]): StoredIconMeta[][] {
        let storedIcons:StoredIconMeta[][] = [[]];
        let storedIconReelOnes:StoredIconMeta[] = storedIcons[0]; // 第一个轮盘的bonus数据
        for (let i = 0; i < this.paramCol; i++) {
            const reelData = reelsData[i];
            reelData.forEach((id, row) => {
                if (id === this.bonusId) {
                    storedIconReelOnes.push({
                        col: i,
                        row: row,
                        Multiple: this.getMultiple()
                    });
                }
            });
        }
        return storedIcons;
    }
    // 方法4 生成Normal轮盘
    private createNormalReelData():number[][][] {
        let reels:number[][][] = [[]]; // 多轮盘的结构
        let reelsData:number[][] = reels[0]; // 填充第一个轮盘的数据
        for (let i = 0; i < this.paramCol; i++) {
            const reelData = this.getReelColData(this.normalReel[i]);
            reelsData.push(reelData);
        }
        return reels;
    }
    // 方法5 计算赢钱金额
    private calTotalWinAmount( lines:TableLineMeta ):number{
        let totalWinAmount = 0; 
        let totalBet = 0;
        for (const line of lines) {
            let symbolId:number = -1;
            for( let i = 1; i < line.length; i++ ){
                if( line[i].id !== this.wildId ){
                    symbolId = line[i].id;
                    break;
                }
            }
            if (symbolId === -1) {
                // -- 全是wild的情况 按照第一个符号来计算
                symbolId = line[0].id;
            }
            const betInfo = this.line_bet[symbolId];
            if (betInfo) {
                if (line.length >= 5) {
                    totalBet += betInfo[2];
                } else if (line.length === 4) {
                    totalBet += betInfo[1];
                } else if (line.length === 3) {
                    totalBet += betInfo[0];
                }
            }
        }
        let bet = PlayerMgr.Instance.getBet();
        totalWinAmount = bet * totalBet;
        return totalWinAmount;
    }
    // 方法6 检查轮盘是否需要从Normal进入FreeSpin
    private checkInFreeSpin( reelsData:number[][] ):boolean{
        let count = 0
        for (let col = 0; col < this.paramCol; col++) {
            let reelData = reelsData[col]
            for (let row = 0; row < this.paramRow; row++) {
                let symbolId = reelData[row]
                if (symbolId === this.scatterId) {
                    count = count + 1
                    break
                }
            }
        }
        return count >= 3
    }
    // 方法7 生成FreeSpin轮盘
    private createFreeSpinReelData(): number[][][] {
        let reels:number[][][] = [[]]; // 多轮盘的结构
        let reelsData:number[][] = reels[0]; // 填充第一个轮盘的数据
        for (let i = 0; i < this.paramCol; i++) {
            const reelData = this.getReelColData(this.freeReel[i]);
            reelsData.push(reelData);
        }
        return reels;
    }
    // 方法8 初始化respin轮盘数据
    private initReSpinReelData( normalReelsData: number[][] ):number[][][]{
        let reSpinReel:number[][][] = [[]];
        // 先给第0层的每一列创建空数组
        for (let col = 0; col < this.paramCol; col++) {
            reSpinReel[0][col] = [];
        }

        for( let col = 0; col < this.paramCol; col++ ){
            let reelData = normalReelsData[col];
            for( let row = 0; row < this.respinRowCount[col]; row++ ){
                if( row < this.paramRow ){
                    let symbolId = reelData[row];
                    if ( symbolId === this.bonusId ){
                        reSpinReel[0][col][row] = this.bonusId;
                    }
                    else{
                        reSpinReel[0][col][row] = this.bounsId2;
                    }
                }
                else{
                    reSpinReel[0][col][row] = this.bounsId2;
                }
            }
        }
        return reSpinReel;
    }
    // 方法9 检查一下当前的线存在不
    private checkLineExists( tableLine:TableLineMeta, oneLine:OneLineMeta ):boolean{
        for (const line of tableLine) {
            if( line.length === oneLine.length ){
                let isSame = true;
                for( let i = 0; i < line.length; i++ ){
                    if( line[i].id == oneLine[i].id && line[i].col == oneLine[i].col && line[i].row == oneLine[i].row ){
                        // -- 这个位置的 id col row 都一样
                    }
                    else {
                        isSame = false;
                        break;
                    }
                }
                if( isSame ){
                    return true;
                }
            }
        }
        return false;
    }
    // 方法10 根据概率是否进入freespin
    private forceInStartFreeSpin():boolean{
        let coin = PlayerMgr.Instance.getCoin();
        if (coin < 5000) {
            // 50%的概率进入freespin
            let rand = this.random(1, 100);
            if (rand <= 50) {
                return true;
            }
        }
        else{
            // 5%的概率进入freespin
            let rand = this.random(1, 100);
            if (rand <= 5) {
                return true;
            }
        }
        return false;
        
        // return false; // -- 测试代码 先固定进入freespin
        // return true; // -- 测试代码 先固定进入freespin
    }
    // 方法11 继续生成respin数据
    private jixuCreateReSpinData():boolean{
        let isNew = false;
        let reelsData = this.tempReSpinReelData[0];
        for( let col = 0; col < this.paramCol; col++ ){
            let reelData = reelsData[col];
            for( let row = 0; row < this.respinRowCount[col]; row++ ){
                let symbolId = reelData[row];
                if ( symbolId !== this.bonusId ){
                    // 根据概率生成 bonusId 
                    let rand = this.random(1, 100);
                    // 5%的概率生成bonusId
                    if( rand <= 5 ){
                        reelsData[col][row] = this.bonusId;
                        isNew = true;
                    }
                }
            }
        }
        return isNew;
    }
    // 方法12 根据respin的结果 生成 storedIcons
    private createReSpinStoredIcons( reelsData: number[][] ):StoredIconMeta[][]{
        let storedIcons:StoredIconMeta[][] = [[]];
        for( let col = 0; col < this.paramCol; col++ ){
            let reelData = reelsData[col];
            for( let row = 0; row < this.respinRowCount[col]; row++ ){
                let symbolId = reelData[row];
                if (symbolId === this.bonusId) {
                    storedIcons[0].push({ col:col, row:row, Multiple:this.getMultiple() });
                }
            }
        }
        return storedIcons;
    }
    // 方法13 检查是否满足进入respin的条件 只要有5个bonus就进入respin
    private checkInReSpin( reelsData:number[][] ):boolean{
        let count = 0
        for (let col = 0; col < this.paramCol; col++) {
            let reelData = reelsData[col]
            for (let row = 0; row < this.paramRow; row++) {
                let symbolId = reelData[row]
                if (symbolId === this.bonusId) {
                    count = count + 1
                }
            }
        }
        return count >= 5
    }
    // 方法14 强制进入respin的情况下 生成一个Normal轮盘数据 满足至少5个bonusId
    private createForceReSpinReelData(): number[][][] {
        let reels:number[][][] = [[]]; // 多轮盘的结构
        let reelsData:number[][] = reels[0]; // 填充第一个轮盘的数据
        for (let i = 0; i < this.paramCol; i++) {
            const reelData = this.getReelColData(this.normalReel[i]);
            reelsData.push(reelData);
        }
        // 随机找出要生成bonus的5列位置
        const bonusCols = new Set<number>();
        while (bonusCols.size < 5) {
            bonusCols.add(this.random(0, this.paramCol - 1));
        }
        // 在这5列的随机位置上生成bonus
        for (const col of bonusCols) {
            const row = this.random(0, this.paramRow - 1);
            reelsData[col][row] = this.bonusId;
        }
        return reels;
    }

    // 方法15 根据概率是否进入freespin
    private forceInStartReSpin():boolean{
        let coin = PlayerMgr.Instance.getCoin();
        if (coin < 5000) {
            // 50%的概率进入freespin
            let rand = this.random(1, 100);
            if (rand <= 50) {
                return true;
            }
        }
        else{
            // 5%的概率进入freespin
            let rand = this.random(1, 100);
            if (rand <= 5) {
                return true;
            }
        }
        return false;

        // return false;
        // return true; // -- 测试代码 先固定进入respin
    }

    // 方法16 计算respin的赢钱金额
    private calReSpinWinAmount( storedIcons:StoredIconMeta[][] ):number{
        let totalWinAmount = 0;
        let storeIcon:StoredIconMeta[] = storedIcons[0];
        for (const icon of storeIcon) {
            totalWinAmount += PlayerMgr.Instance.getBet() * icon.Multiple;
        }
        // 实现具体的赢钱金额计算逻辑
        return totalWinAmount;
    }

    // 计算结果数据
    /*
        jsonResult = {
            bet: number, // 当前的投注金额
            betList: number[], // 可选的投注金额列表
            jackpots: any, // jackpot数据
            lastAction: string, // 上一个action
            action: string, // 当前的action
            nextAction: string, // 下一个action
            reels: number[][][], // 轮盘数据
            lines: any[], // 连线数据
            storedIcons: any[], // bonus数据
            winAmount: number, // 赢钱金额
        }
    */
    public calResultData():any{
        let jsonResult:JsonResult = {} as JsonResult;
        jsonResult.bet = PlayerMgr.Instance.getBet();
        jsonResult.betList = PlayerMgr.Instance.getBetList();
        jsonResult.jackpots = PlayerMgr.Instance.getJackpots();

        if ( this.m_action === ActionType.NORMAL ){
            // 1:强制进入freespin
            let forceFreeSpin = this.forceInStartFreeSpin();
            if( forceFreeSpin ){
                // 设置action的状态
                jsonResult.lastAction = this.m_lastAction;
                jsonResult.action = this.m_action;
                jsonResult.nextAction = ActionType.FREESPIN;
                // 生成 normal reels数据
                jsonResult.reels = this.createForceFreeSpinReelData();
                // 生成连线数据
                jsonResult.lines = this.getReelsLines(jsonResult.reels[0]);
                // 生成bonus数据
                jsonResult.storedIcons = this.getStoredIcons(jsonResult.reels[0]);
                // 生成赢钱数据
                jsonResult.winAmount = this.calTotalWinAmount(jsonResult.lines[0]);
                // 需要临时记录 等freespin结束后再恢复正常轮盘数据
                this.tempNormalReelData = this.deepClone( jsonResult.reels );
                this.tempStoreIconsData = this.deepClone( jsonResult.storedIcons );
                // 初始化次数
                jsonResult.freespin = {} as freespinData;
                jsonResult.freespin.freeSpinNewCount = this.freeSpinTotalCount;
                jsonResult.freespin.freeSpinsLeftCount = this.freeSpinTotalCount;
                jsonResult.freespin.freeSpinsTotalCount = this.freeSpinTotalCount;
                // 初始化freespin轮盘数据
                jsonResult.freeSpinReels = this.createFreeSpinReelData();

                // 改变状态
                this.m_action = ActionType.FREESPIN;
                this.freeSpinCurrentCount = this.freeSpinTotalCount;
                this.m_nextAction = ActionType.FREESPIN;
                return jsonResult;
            }

            // 2:强制进入respin
            let forceReSpin = this.forceInStartReSpin();
            if( forceReSpin ){
                // 设置action的状态
                jsonResult.lastAction = this.m_lastAction;
                jsonResult.action = this.m_action;
                jsonResult.nextAction = ActionType.RESPIN;
                // 生成 normal reels数据
                jsonResult.reels = this.createForceReSpinReelData();
                // 生成连线数据
                jsonResult.lines = this.getReelsLines(jsonResult.reels[0]);
                // 生成bonus数据
                jsonResult.storedIcons = this.getStoredIcons(jsonResult.reels[0]);
                // 生成赢钱数据
                jsonResult.winAmount = this.calTotalWinAmount(jsonResult.lines[0]);

                // 需要临时记录 等reSpin结束后再恢复正常轮盘数据
                this.tempNormalReelData = this.deepClone( jsonResult.reels );
                this.tempStoreIconsData = this.deepClone( jsonResult.storedIcons );

                // 初始化次数
                this.reSpinCurCount = this.reSpinsTotalCount;
                jsonResult.respin = {} as reSpinData
                jsonResult.respin.reSpinsTotalCount = this.reSpinsTotalCount;
                jsonResult.respin.reSpinCurCount = this.reSpinCurCount;

                // 初始化reSpin的轮盘数据
                jsonResult.respinReels = this.initReSpinReelData( jsonResult.reels[0] );
                // 临时记录
                this.tempReSpinReelData = this.deepClone(jsonResult.respinReels);

                // 改变状态
                this.m_action = ActionType.RESPIN;
                this.m_nextAction = ActionType.RESPIN;
                this.m_lastAction = ActionType.NORMAL;

                return jsonResult;
            }

            // 3: 正常情况
            // 设置action的状态
            jsonResult.lastAction = this.m_lastAction;
            jsonResult.action = this.m_action;
            jsonResult.nextAction = ActionType.NORMAL;
            // 生成 normal reels数据
            jsonResult.reels = this.createNormalReelData();
            // 生成连线数据
            jsonResult.lines = this.getReelsLines(jsonResult.reels[0]);
            // 生成bonus数据
            jsonResult.storedIcons = this.getStoredIcons(jsonResult.reels[0]);
            // 生成赢钱数据
            jsonResult.winAmount = this.calTotalWinAmount(jsonResult.lines[0]);

            // 这里需要检查是否进入freespin
            let inFreeGame = this.checkInFreeSpin( jsonResult.reels[0] );
            if( inFreeGame ){
                this.m_nextAction = ActionType.FREESPIN;
                jsonResult.nextAction = this.m_nextAction;

                // 需要临时记录 等freespin结束后再恢复正常轮盘数据
                this.tempNormalReelData = this.deepClone( jsonResult.reels );
                this.tempStoreIconsData = this.deepClone( jsonResult.storedIcons );
                // 初始化次数
                jsonResult.freespin = {} as freespinData;
                jsonResult.freespin.freeSpinNewCount = this.freeSpinTotalCount;
                jsonResult.freespin.freeSpinsLeftCount = this.freeSpinTotalCount;
                jsonResult.freespin.freeSpinsTotalCount = this.freeSpinTotalCount;
                // 初始化freespin轮盘数据
                jsonResult.freeSpinReels = this.createFreeSpinReelData();

                // 改变状态
                this.m_action = ActionType.FREESPIN;
                this.freeSpinCurrentCount = this.freeSpinTotalCount;

                return jsonResult;
            }

            // 检查是否进入reSpin
            let inReSpin = this.checkInReSpin( jsonResult.reels[0] );
            if( inReSpin ){
                this.m_nextAction = ActionType.RESPIN;
                jsonResult.nextAction = this.m_nextAction;

                // 需要临时记录 等reSpin结束后再恢复正常轮盘数据
                this.tempNormalReelData = this.deepClone( jsonResult.reels );
                this.tempStoreIconsData = this.deepClone( jsonResult.storedIcons );

                // 初始化次数
                this.reSpinCurCount = this.reSpinsTotalCount;
                jsonResult.respin = {} as reSpinData
                jsonResult.respin.reSpinsTotalCount = this.reSpinsTotalCount;
                jsonResult.respin.reSpinCurCount = this.reSpinCurCount;

                // 初始化reSpin的轮盘数据
                jsonResult.respinReels = this.initReSpinReelData( jsonResult.reels[0] );
                // 临时记录
                this.tempReSpinReelData = this.deepClone(jsonResult.respinReels);

                // 改变状态
                this.m_action = ActionType.RESPIN;
                this.m_lastAction = ActionType.NORMAL;
                
                return jsonResult;
            }

            this.m_nextAction = ActionType.NORMAL;
            return jsonResult;
        }

        if( this.m_action === ActionType.FREESPIN ){
            if( this.freeSpinCurrentCount > 1 ){
                this.m_lastAction = ActionType.FREESPIN;
                this.m_action = ActionType.FREESPIN;

                // 设置action的状态
                jsonResult.lastAction = this.m_lastAction;
                jsonResult.action = this.m_action;
                jsonResult.nextAction = ActionType.FREESPIN;
                //生成轮盘数据 
                jsonResult.reels = this.deepClone(this.tempNormalReelData);

                // 继续freeSpin
                this.freeSpinCurrentCount = this.freeSpinCurrentCount - 1;
                // 初始化次数
                jsonResult.freespin = {} as freespinData;
                jsonResult.freespin.freeSpinNewCount = 0;
                jsonResult.freespin.freeSpinsLeftCount = this.freeSpinCurrentCount;
                jsonResult.freespin.freeSpinsTotalCount = this.freeSpinTotalCount;

                // 生成freeSpin轮盘数据
                jsonResult.freeSpinReels = this.createFreeSpinReelData();
                // 生成freespin连线数据 第一个轮盘;
                jsonResult.lines = this.getReelsLines(jsonResult.freeSpinReels[0]);
                // 赢钱金额
                jsonResult.winAmount = this.freeSpinTotalWinAmount + this.calTotalWinAmount(jsonResult.lines[0]);
                // 记录临时赢钱
                this.freeSpinTotalWinAmount = jsonResult.winAmount;
            }
            else{
                this.m_lastAction = ActionType.FREESPIN;
                this.m_action = ActionType.FREESPIN;
                this.m_nextAction = ActionType.NORMAL;
                // 清空次数
                this.freeSpinCurrentCount = 0;
                // 设置action的状态
                jsonResult.lastAction = this.m_lastAction;
                jsonResult.action = this.m_action;
                jsonResult.nextAction = this.m_nextAction;
                //生成轮盘数据 
                jsonResult.reels = this.deepClone(this.tempNormalReelData);
                jsonResult.storedIcons = this.deepClone(this.tempStoreIconsData);
                // 初始化次数
                jsonResult.freespin = {} as freespinData;
                jsonResult.freespin.freeSpinNewCount = 0;
                jsonResult.freespin.freeSpinsLeftCount = this.freeSpinCurrentCount;
                jsonResult.freespin.freeSpinsTotalCount = this.freeSpinTotalCount;

                // 生成freeSpin轮盘数据
                jsonResult.freeSpinReels = this.createFreeSpinReelData();
                // 生成freespin连线数据 第一个轮盘;
                jsonResult.lines = this.getReelsLines(jsonResult.freeSpinReels[0]);
                // 赢钱金额
                jsonResult.winAmount = this.freeSpinTotalWinAmount + this.calTotalWinAmount(jsonResult.lines[0]);

                // 重置数据
                this.m_action = ActionType.NORMAL;
                this.freeSpinTotalWinAmount = 0;
                this.tempNormalReelData = [];
                this.tempStoreIconsData = [];
            }

            return jsonResult;
        }

        if( this.m_action === ActionType.RESPIN ){
            if( this.reSpinCurCount >= 1 ){
                // 继续respin
                this.m_lastAction = ActionType.RESPIN;
                this.m_action = ActionType.RESPIN;
                // 设置action的状态
                jsonResult.lastAction = this.m_lastAction;
                jsonResult.action = this.m_action;
                jsonResult.nextAction = ActionType.RESPIN;

                //生成Normal轮盘数据
                jsonResult.reels = this.deepClone(this.tempNormalReelData);

                // 这里继续生成 生成的数据放入 this.tempReSpinReelData
                let isNew = this.jixuCreateReSpinData();
                // respin轮盘数据
                jsonResult.respinReels = this.deepClone(this.tempReSpinReelData);
                // storeicons数据 根据最新的轮盘数据重新生成
                jsonResult.storedIcons = this.createReSpinStoredIcons( this.tempReSpinReelData[0] );

                // respin的数据
                jsonResult.respin = {} as reSpinData;

                if ( isNew ){
                    this.reSpinCurCount = this.reSpinsTotalCount;
                    jsonResult.respin.reSpinsTotalCount = this.reSpinsTotalCount;
                    jsonResult.respin.reSpinCurCount = this.reSpinCurCount;
                }else{
                    this.reSpinCurCount = this.reSpinCurCount - 1;
                    jsonResult.respin.reSpinsTotalCount = this.reSpinsTotalCount;
                    jsonResult.respin.reSpinCurCount = this.reSpinCurCount;

                    if( this.reSpinCurCount <= 0 ){
                        jsonResult.action = this.m_action;
                        jsonResult.nextAction = ActionType.NORMAL;

                        // 赢钱金额
                        jsonResult.winAmount = this.calReSpinWinAmount( jsonResult.storedIcons );

                        // respin结束 恢复正常轮盘数据
                        this.m_lastAction = ActionType.RESPIN;
                        this.m_action = ActionType.NORMAL;
                        this.m_nextAction = ActionType.NORMAL;
                        this.tempReSpinReelData = [];
                    }
                }
            }
            return jsonResult;
        }
    }

    /**
     * 将 JSON 对象保存为本地 JSON 文件
     * @param jsonObj JSON 数据对象
     * @param fileName 文件名（例：data.json）
     */
    private saveJsonToFile(jsonObj: any, fileName: string) {
        // try {
        //     // 格式化 JSON 字符串（方便阅读）
        //     const jsonStr = JSON.stringify(jsonObj, null, 2);

        //     // ==================== 关键：获取游戏可写路径 ====================
        //     // Windows 运行/打包后路径：C:/Users/用户名/AppData/LocalLow/公司名/游戏名/
        //     const writePath = sys.writablePath + fileName;

        //     // 写入文件
        //     sys.writeFile(writePath, jsonStr, (err) => {
        //         if (err) {
        //             console.error("JSON 文件保存失败：", err);
        //             return;
        //         }
        //         console.log("JSON 文件生成成功！路径：", writePath);
        //         // Windows 可以直接打印路径，去文件夹里找文件
        //     });
        // } catch (e) {
        //     console.error("JSON 转换/写入异常：", e);
        // }
    }
}


