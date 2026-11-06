import { _decorator, Component, Node, tween, Tween, Vec3, AnimationClip, Animation, assert } from 'cc';
import { UIMgr, UICtrl } from '../Mgr/UIMgr';
import { BaseReelUnit } from './BaseReelUnit';
import { BaseGameTable } from './BaseGameTable';
import { LevelConfig, ReelTableConfig, ReelUnitConfig, SymbolType, ActionType } from '../InterFace/LevelConfig';
import { LevelMgr } from "../Mgr/LevelMgr";
import { SymbolMgr } from '../Mgr/SymbolMgr';
import { BaseSymbolUnit } from './BaseSymbolUnit';
import { SoundMgr } from '../Mgr/SoundMgr';
import { BaseMutilReelUnit } from './BaseMutilReelUnit';
import { Utils } from '../Util/Utils';

const { ccclass, property } = _decorator;

@ccclass('BaseReelTable')
export class BaseReelTable extends UICtrl {

    protected initView(): void {

    }

    public m_abName: string = "";
    public m_levelConfig: LevelConfig = null;
    public m_reelTableConfig: ReelTableConfig = null;
    public m_reelTableIndex: number = 0;
    public m_gameTableCompent: BaseGameTable = null;

    public m_stopDoneNum: number = 0;
    public m_reelUnitsCount: number = 0;

    public m_featureNode: Node = null;
    public m_effectNode: Node = null;

    public m_startRollMark: boolean = false;
    public m_stopRollMark: boolean = false;


    public m_reelViewData: number[][] = null;// 轮盘停止滚动 服务器传来的信号块数据
    public m_needQuickRoll = false;
    public m_reelUnitCompent: (BaseReelUnit | BaseMutilReelUnit)[] = [];

    public m_delayCallbackTween: Tween<Node> | null = null;
    public m_lineTween: Tween<Node> | null = null;
    public m_effectLineTween: Tween<Node> | null = null;
    public m_oneLineTween: Tween<Node> | null = null;

    public m_effectNodeList: Node[][] = []; // 跑马灯特效的节点
    public m_featureNodeList: Node[][] = []; // feature层的节点

    start() {
        console.log('BaseReelTable=====================运行');
    }

    update(deltaTime: number) {

    }

    // -------------- 子类可能需要重写的接口 -------------------- //
    // 播放滚轴停止音效 子类重写
    public playReelStopDoneSounds(): void {

    }
    // 获取每个轴的停止时间间隔 (针对快滚 每个子类重写)
    public getStopDelayTime(): number[] {
        let delayTimes = [];
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let time = i * 0.1; // 暂定延迟0.1秒
            delayTimes.push(time);
        }
        return delayTimes;
    }

    public createOtherUI(): void {

    }

    // 添加快滚特效 (子类重写)
    public addQuickEffect(col: number): void {

    }

    // 移除快滚特效
    public removeQuickEffect(col: number): void {

    }

    // wild信号快的飞行动画
    public wildFlyAction(col: number, row: number): void {

    }

    // bonus的飞行动画
    public bonusFlyAction(col: number, row: number) {

    }

    // -------------- 子类可能需要重写的接口 -------------------- //


    // tableIndex 从0开始
    public initUI(levelConfig: LevelConfig, reelTableConfig: ReelTableConfig, tableIndex: number, gameTableCompent: BaseGameTable): void {
        this.m_levelConfig = levelConfig;
        this.m_abName = this.m_levelConfig.BundleName;
        this.m_reelTableConfig = reelTableConfig;
        this.m_reelTableIndex = tableIndex;
        this.m_gameTableCompent = gameTableCompent; // GameTable的组件
        this.m_stopDoneNum = 0;
        // 滚轴的数量 (列)
        this.m_reelUnitsCount = reelTableConfig.ReelUnits.length;
        // 创建滚轴组件
        this.createReelUnits();
        // 创建其他UI 子类重写
        this.createOtherUI();
        // 创建Feature 用于信号块的落地动画
        this.createFeatureNode();
        // 创建Effect 用于跑马灯的动画
        this.createEffectNode();
    }

    public getReelUnitCompent(reelUnitIndex: number): BaseReelUnit | BaseMutilReelUnit {
        assert(reelUnitIndex != null, " !! reelUnitIndex is null !! ");
        assert(this.m_reelUnitCompent[reelUnitIndex] != null, " !! 滚轴组件为null !! ");
        return this.m_reelUnitCompent[reelUnitIndex];
    }

    // 创建滚轴
    public createReelUnits(): void {
        if (this.m_reelTableConfig.ClipType === 1) {
            for (let i = 0; i < this.m_reelUnitsCount; i++) {
                // 添加组件
                let reelUnitsName: string = this.m_reelTableConfig.ReelUnits[i];
                let reelUnitConfig: ReelUnitConfig = this.m_levelConfig.ReelUnit[reelUnitsName];
                const compent: BaseReelUnit = this.view["Reel" + i].addComponent(reelUnitConfig.Compent) as BaseReelUnit;
                // 初始化组件参数
                compent.initUI(this.m_levelConfig, reelUnitConfig, i, this, this.m_reelTableIndex);
                compent.resetRollData(this.m_reelTableConfig.RollData[i])
                // 存入compent指针
                this.m_reelUnitCompent.push(compent);
            }
        }
        else if (this.m_reelTableConfig.ClipType === 3) {
            // ReSpin模式
            for (let i = 0; i < this.m_reelUnitsCount; i++) {
                // 添加组件
                let reelUnitsName: string = this.m_reelTableConfig.ReelUnits[i];
                let reelUnitConfig: ReelUnitConfig = this.m_levelConfig.ReelUnit[reelUnitsName];
                const compent: BaseMutilReelUnit = this.view["Reel" + i].addComponent(reelUnitConfig.Compent) as BaseMutilReelUnit;
                // 初始化组件参数
                compent.initUI(this.m_levelConfig, reelUnitConfig, i, this, this.m_reelTableIndex);
                // 存入compent指针
                this.m_reelUnitCompent.push(compent);
            }
        }
    }

    // 创建Feature 用于信号块的落地动画
    public createFeatureNode(): void {
        if (this.m_featureNode == null) {
            this.m_featureNode = new Node("FeatureNode");
            this.node.addChild(this.m_featureNode)
        }
    }

    // 创建Effect 用于跑马灯的动画
    public createEffectNode(): void {
        if (this.m_effectNode == null) {
            this.m_effectNode = new Node("EffectNode");
            this.node.addChild(this.m_effectNode);
        }
    }

    // 初始化轮盘 根据数据显示轮盘上的信号块
    public loadReelUnitsUI(viewSymbolData: number[][]): void {
        //-- 创建轴上的信号块
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            const compent = this.getReelUnitCompent(i);
            compent.loadSymbolUnitUI(viewSymbolData[i]);
        }
    }

    // 轮盘滚动
    public startRoll(): void {
        if (this.m_startRollMark) {
            return;
        }
        this.m_startRollMark = true;
        // 清除feature层 将信号块归还给滚轴
        this.clearFeature();
        // 清除effect层的连线动画
        Tween.stopAllByTarget(this.m_effectNode);
        this.clearEffect();

        // 必须缓一帧 让feature层的信号块归还到滚轴上
        this.m_delayCallbackTween = Utils.performWithDelay(this.node, () => {
            for (let i = 0; i < this.m_reelUnitsCount; i++) {
                const compent = this.getReelUnitCompent(i);
                compent.startRoll();
            }
            this.m_delayCallbackTween = null;
        }, 0.02);
    }

    // 清除feature层 将信号块归还给滚轴
    public clearFeature(): void {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.RESPIN) {
            // respin没有结束 不能清除
            return
        }
        if (action == ActionType.NORMAL && nextAction == ActionType.RESPIN) {
            // 进入了respin 也不能清除
            return
        }
        this.putAllSymbolToReelUnit();
        this.m_featureNodeList = [];
    }

    // 停止滚动
    public stopRoll(viewSymbolData: number[][], isQuickStop: boolean): void {
        assert(viewSymbolData != null, " !! viewSymbolData is nil !! ");
        assert(viewSymbolData.length == this.m_reelUnitsCount, " !! 服务器返回的数据与当前滚轴个数对应不上 !! ");
        if (this.m_stopRollMark) {
            assert(false, "error 不知道从哪里点击过来了 ");
            return;
        }
        this.m_stopRollMark = true;
        this.m_reelViewData = viewSymbolData;
        if (isQuickStop) {
            // 快停
            for (let i = 0; i < this.m_reelUnitsCount; i++) {
                const compent = this.getReelUnitCompent(i);
                compent.stopRoll(viewSymbolData[i], isQuickStop);
            }
            // 播放停止音效
            this.playReelStopDoneSounds();
        }
        else {
            // -- 开始停止
            let result = this.checkNeedQuickRoll(viewSymbolData, this.m_reelUnitsCount - 1);
            this.m_needQuickRoll = result.needQuickRoll;
            if (this.m_needQuickRoll) {
                // -- 此时是一个轴一个轴的停止
                const compent = this.getReelUnitCompent(0);
                compent.stopRoll(viewSymbolData[0], isQuickStop);
            }
            else {
                this.normalStopRoll(viewSymbolData);
            }
        }
    }

    // 正常停止
    public normalStopRoll(viewSymbolData: number[][]) {
        if (this.m_effectLineTween) {
            this.m_effectLineTween.stop();
            this.m_effectLineTween = null;
        }

        const anims: Array<ReturnType<typeof tween>> = [];
        let delayTimes = this.getStopDelayTime();
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            anims.push(
                tween(this.node)
                    .delay(delayTimes[i])
                    .call(() => {
                        const compent = this.getReelUnitCompent(i);
                        compent.stopRoll(viewSymbolData[i], false);
                    })
            );
        }
        this.m_effectLineTween = tween(this.node).sequence(...anims).start();
    }

    /*
        检查是否需要快滚 <只要出现2个scatter需要快滚>
        col:检查从1到col所在列的有scatter个数 <每列的scatter超过一个只算一个> 最后一列不算
    */
    public checkNeedQuickRoll(viewSymbolData: number[][], col: number): any {
        let hasCount = 0;
        for (let i = 0; i < col; i++) {
            if (this.hasScatterSymbol(viewSymbolData[i])) {
                hasCount = hasCount + 1;
            }
        }
        let result: any = {}
        result.needQuickRoll = hasCount >= 2; // 是否需要快滚
        result.scatterCount = hasCount;
        return result;
    }

    // -- 检查此列数据时候有scatter信号块
    public hasScatterSymbol(viewSymbolData: number[]): boolean {
        for (const symbolId of viewSymbolData) {
            let config = LevelMgr.Instance.getSymbolConfig(symbolId);
            if (config.type == SymbolType.SCATTER) {
                return true;
            }
        }
        return false;
    }

    // -- 检查此列数据时候有bonus信号块
    public hasBonusSymbol(viewSymbolData: number[]): boolean {
        for (const symbolId of viewSymbolData) {
            let config = LevelMgr.Instance.getSymbolConfig(symbolId);
            if (config.type == SymbolType.BONUS) {
                return true;
            }
        }
        return false;
    }


    // 从新开始滚动的时候 需要将feature的信号块放入滚轴中
    public putAllSymbolToReelUnit(): void {
        // 1. 获取有效元素个数（推荐）
        const validLength = Object.keys(this.m_featureNodeList).length;
        if (validLength == 0) {
            return;
        }
        // 注意 m_featureNodeList 是一个非连续的 使用 Object.keys() 遍历有效索引
        const validKeys = Object.keys(this.m_featureNodeList);
        for (const key of validKeys) {
            // 将字符串索引转为数字
            const index = Number(key);
            const value = this.m_featureNodeList[index];
            const c_validKeys = Object.keys(value);
            for (const c_key of c_validKeys) {
                // 将字符串索引转为数字
                const c_index = Number(c_key);
                const symbolNode: Node = value[c_index];// 这是 symbolNode
                let compent = symbolNode.getComponent(this.m_levelConfig.BundleName + "_Symbol_Ctrl") as BaseSymbolUnit;
                compent.m_reelUnitCompent.putSymbolToMyReelUnit(symbolNode);
            }
        }
    }

    // -- 在feature上显示信号块 (只是将滚轴上的信号块放到feature里面)
    public showSymbolToFeature(col: number, row: number, symbolNode: Node) {
        assert(col != null, " !! col is null !! ");
        assert(row != null, " !! row is null !! ");
        assert(symbolNode != null, " !! symbolNode is null !! ");
        if (this.m_featureNodeList[col] != null && this.m_featureNodeList[col][row] != null) {
            // 已经创建
            return
        }
        if (this.m_featureNodeList[col] == null) {
            this.m_featureNodeList[col] = [];
        }
        this.m_featureNodeList[col][row] = symbolNode;
        // -- 从滚轴放入feature
        symbolNode.parent = this.m_featureNode;
        let worldPos = this.getSymbolWorldPos(col, row);
        let localPos = new Vec3();
        // 将世界坐标转化为局部坐标
        this.m_featureNode.inverseTransformPoint(localPos, worldPos);
        symbolNode.setPosition(localPos);
    }


    /*
        某个滚轴停止 col:滚轴的索引
    */
    public oneReelUnitStopDone(col: number): void {
        assert(col != null, " !! oneReelUnitStopDone col is null !! ");
        if (this.m_needQuickRoll) {
            // -- 移除当前快滚
            this.removeQuickEffect(col);
        }

        this.m_stopDoneNum = this.m_stopDoneNum + 1;
        if (this.m_stopDoneNum >= this.m_reelUnitsCount) {
            this.clearState();
            // 当所有滚轴停止完毕
            this.m_gameTableCompent.oneReelTableStopDone();
        }
        else {
            // -- 针对快滚的逻辑
            if (this.m_needQuickRoll) {
                let nextIndex = col + 1;
                let result = this.checkNeedQuickRoll(this.m_reelViewData, nextIndex);
                let quickRoll = result.needQuickRoll;
                let scatterCount = result.scatterCount;
                if (quickRoll) {
                    // -- 设置速度
                    const compent = this.getReelUnitCompent(nextIndex);
                    compent.setQuickSpeed();
                    this.addQuickEffect(nextIndex);
                    // -- 快滚音效
                    let soundFile = this.m_levelConfig.SoundsFile["LongRun"];
                    if (soundFile) {
                        SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
                    }
                    // 进行快滚
                    Utils.performWithDelay(this.node, () => {
                        compent.stopRoll(this.m_reelViewData[nextIndex], false);
                    }, this.m_reelTableConfig.QuickActionTime);
                } else {
                    const compent = this.getReelUnitCompent(nextIndex);
                    compent.stopRoll(this.m_reelViewData[nextIndex], false);
                }
            }
        }
    }

    /*
        -- 播放当前轮盘的连线动画 tableLine:当前轮盘的连线数据
        tableLine的格式:[
            [
                {id:200,col:1,row:2},
                {id:200,col:2,row:2},
                {id:200,col:3,row:2}
            ],// 第一条线
            [
                {id:200,col:1,row:2},
                {id:200,col:2,row:1},
                {id:200,col:3,row:2}
            ],// 第二条线
            ...
        ]
    */
    public playLineAction(tableLine: any): void {
        assert(tableLine != null, " !! tableLine is null !! ");
        if (tableLine.length == 0) {
            return;
        }

        // -- 添加一层黑色遮罩 (暂时不加这个效果)


        // -- 先显示所有连线
        if (this.m_lineTween) {
            this.m_lineTween.stop();
            this.m_lineTween = null;
        }
        this.m_lineTween = tween(this.m_effectNode).call(() => {
            for (let lineData of tableLine) {
                this.playLineAndEffectAction(lineData)
            }
        })
            .delay(2)
            .call(() => {
                // 清除特效层
                this.clearEffect();
                // // -- 清除feature层 将信号块归还给滚轴
                // this.clearFeature();
            })
            .call(() => {
                this.playSingleLineAction(tableLine);
            })
            .start();
    }

    // 一条线一条线的显示
    public playSingleLineAction(tableLine: any) {
        assert(tableLine != null, " !! tableLine is null !! ");
        if (tableLine.length == 0) {
            return;
        }

        const animSequence: Array<ReturnType<typeof tween>> = [];
        for (let line of tableLine) {
            animSequence.push(
                tween(this.m_effectNode).call(() => {
                    this.playLineAndEffectAction(line);
                })
            );
            animSequence.push(
                tween(this.m_effectNode).delay(2)
            );
            animSequence.push(
                tween(this.m_effectNode).call(() => {
                    this.clearEffect();
                })
            );
        }

        // 2. 串联所有动作 + 设置循环 + 启动
        this.m_oneLineTween = tween(this.m_effectNode)
            // 将数组中的所有tween按顺序执行
            .sequence(...animSequence)
            // 永久循环（核心：循环整个动作序列）
            .repeatForever()
            // 启动动画
            .start();
    }

    /* 
        -- 播放一条线上的跑马灯特效
        oneLine的格式:[
            {id:200,col:1,row:2},
            {id:200,col:2,row:2},
            {id:200,col:3,row:2}
        ]
    */
    public playLineAndEffectAction(oneLine: any): void {
        assert(oneLine != null, " !! oneLine is null !! ");
        if (oneLine.length == 0) {
            return;
        }
        // -- 添加连线的特效
        for (let i = 0; i < oneLine.length; i++) {
            this.addPaoMaDengEffect(oneLine[i]);
        }
    }

    /* 
        -- 添加一个信号块上的跑马灯特效
        meta : {id:200,col:1,row:2}
    */
    public addPaoMaDengEffect(meta: any) {
        assert(meta != null, " !! meta is null !! ");
        assert(meta.id != null, " !! meta.id is null !! ");
        assert(meta.col != null, " !! meta.col is null !! ");
        assert(meta.row != null, " !! meta.row is null !! ");
        let id = meta.id;
        let col = meta.col;
        let row = meta.row;
        if (this.m_effectNodeList[col] && this.m_effectNodeList[col][row]) {
            // 已经创建
            return;
        }

        let effectConfig = SymbolMgr.Instance.getEffectConfigByName("paoMaDeng")
        if (effectConfig && effectConfig.file != "") {
            // -- 添加跑马灯特效
            if (this.m_effectNodeList[col] == null) {
                this.m_effectNodeList[col] = [];
            }

            // 添加跑马灯特效 <注意 预制体下面必须有节点名字为 sp_run 的子节点 >
            let effect = SymbolMgr.Instance.getEffectNodeByName("paoMaDeng");
            effect.node.parent = this.m_effectNode;
            effect.node.active = true;
            let worldPos = this.getSymbolWorldPos(meta.col, meta.row);
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.m_effectNode.inverseTransformPoint(localPos, worldPos);
            effect.node.setPosition(localPos);
            let spRun = effect.node.getChildByName("sp_run");
            assert(spRun != null, " !! spRun is null !! ");
            let animation = spRun.getComponent(Animation);
            animation.play(effect.config.actionName);
            animation.getState(effect.config.actionName).wrapMode = AnimationClip.WrapMode.Loop; // 设置循环播放
            // 存入节点指针
            this.m_effectNodeList[col][row] = effect;
        }

        // -- 信号快播放连线动画 这里需要区分feature和reelunit
        this.playSymbolLineAction(id, col, row);
    }

    // 单个信号块 播放连线动画
    public playSymbolLineAction(id: number, col: number, row: number) {
        assert(id != null, " !! id is null !! ");
        assert(col != null, " !! col is null !! ");
        assert(row != null, " !! row is null !! ");
        let lineActionName = this.m_levelConfig.SymbolLineAction[id.toString()];
        if (lineActionName != "") {
            this.playSymbolAction(col, row, lineActionName, false, true, null);
        }
    }

    public stopSymbolLineAction(): void {
        Tween.stopAllByTarget(this.m_effectNode);
        this.clearEffect();
    }

    // -- 播放轮盘上信号块的动画
    public playSymbolAction(col: number, row: number, actionName: string, isLoop: boolean, isLineAction: boolean = false, callBack: Function | null = null): void {
        assert(col != null, " !! col is null !! ");
        assert(row != null, " !! row is null !! ");
        assert(actionName != null, " !! actionName is null !! ");
        assert(actionName != "", " !! actionName is string empty !! ");
        // -- 信号快播放连线动画 这里需要区分feature和reelunit
        if (this.m_featureNodeList[col] && this.m_featureNodeList[col][row]) {
            let symbolNode = this.m_featureNodeList[col][row]
            let compent = symbolNode.getComponent(this.m_levelConfig.BundleName + "_Symbol_Ctrl") as BaseSymbolUnit;
            compent.playSymbolAction(actionName, isLoop, callBack, isLineAction);
        } else {
            let compent = this.getReelUnitCompent(col);
            compent.playSymbolAction(row, actionName, isLoop, isLineAction, callBack);
        }
    }

    // 获取信号块的世界坐标
    public getSymbolWorldPos(col: number, row: number): Vec3 {
        assert(col != null, " !! getSymbolWorldPos col is null !! ");
        assert(row != null, " !! getSymbolWorldPos row is null !! ");
        let compent = this.getReelUnitCompent(col);
        return compent.getSymbolWorldPos(row)
    }

    public clearEffect(): void {
        // 注意 m_effectNodeList 是一个非连续的 使用 Object.keys() 遍历有效索引
        const validKeys = Object.keys(this.m_effectNodeList);
        for (const key of validKeys) {
            // 将字符串索引转为数字
            const index = Number(key);
            const value = this.m_effectNodeList[index];
            const c_validKeys = Object.keys(value);
            for (const c_key of c_validKeys) {
                // 将字符串索引转为数字
                const c_index = Number(c_key);
                const c_value: any = value[c_index];// 这是特效跑马灯的数据

                let animation = c_value.node.getChildByName("sp_run").getComponent(Animation);
                // 停止动画
                animation.stop();
                // 归还信号块
                SymbolMgr.Instance.resetEffectNodeUnUsed(c_value);
            }
        }
        this.m_effectNodeList = []
    }

    // 当轮盘停止后 播放轮盘上所有scatter信号块的动画
    public playAllScatterAction(): void {
        let actionName = ""
        let reelData: number[][] = LevelMgr.Instance.getLevelModel().getSpinReelData()[this.m_reelTableIndex];
        assert(reelData != null, " !! reelData is nil !! ")
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let onnColData = reelData[i];
            for (let j = 0; j < onnColData.length; j++) {
                let symbolId = onnColData[j];
                let config = LevelMgr.Instance.getSymbolConfig(symbolId);
                if (config.type == SymbolType.SCATTER) {
                    actionName = this.m_levelConfig.SymbolLineAction[symbolId.toString()];
                    if (actionName != "") {
                        this.playSymbolAction(i, j, actionName, true, false, null);
                    }
                }
            }
        }

        // let lineActionName = this.m_levelConfig.SymbolLineAction[id.toString()];
    }

    public playAllBonusAction(): void {
        let actionName = ""
        let reelData: number[][] = LevelMgr.Instance.getLevelModel().getSpinReelData()[this.m_reelTableIndex];
        assert(reelData != null, " !! reelData is nil !! ")
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let onnColData = reelData[i];
            for (let j = 0; j < onnColData.length; j++) {
                let symbolId = onnColData[j];
                let config = LevelMgr.Instance.getSymbolConfig(symbolId);
                if (config.type == SymbolType.BONUS) {
                    actionName = this.m_levelConfig.SymbolLineAction[symbolId.toString()];
                    if (actionName != "") {
                        this.playSymbolAction(i, j, actionName, true, false, null);
                    }
                }
            }
        }
    }

    public playAllBonusActionWithName(actionName: string, isLoop: boolean): void {
        let reelData: number[][] = LevelMgr.Instance.getLevelModel().getSpinReelData()[this.m_reelTableIndex];
        assert(reelData != null, " !! reelData is nil !! ")
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let onnColData = reelData[i];
            for (let j = 0; j < onnColData.length; j++) {
                let symbolId = onnColData[j];
                let config = LevelMgr.Instance.getSymbolConfig(symbolId);
                if (config.type == SymbolType.BONUS) {
                    if (actionName != "") {
                        this.playSymbolAction(i, j, actionName, isLoop, false, null);
                    }
                }
            }
        }
    }

    public clearState() {
        this.m_startRollMark = false;
        this.m_stopRollMark = false;
        this.m_needQuickRoll = false;
        this.m_stopDoneNum = 0;
        this.m_reelViewData = null;
        if (this.m_delayCallbackTween != null) {
            this.m_delayCallbackTween.stop();
            // 清空引用，避免内存泄漏
            this.m_delayCallbackTween = null;
        }
        if (this.m_lineTween) {
            this.m_lineTween.stop();
            this.m_lineTween = null;
        }
        if (this.m_effectLineTween) {
            this.m_effectLineTween.stop();
            this.m_effectLineTween = null;
        }
        if (this.m_oneLineTween) {
            this.m_oneLineTween.stop();
            this.m_oneLineTween = null;
        }
    }

    onDisable() {
        this.clearState();
        super.onDisable();
    }

    onDestroy() {
        this.clearState();
        super.onDestroy();
    }
}




