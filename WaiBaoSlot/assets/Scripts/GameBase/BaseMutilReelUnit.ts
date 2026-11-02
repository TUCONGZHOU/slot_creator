import { _decorator, assert, Component, Mask, Node, Size, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UIMgr, UICtrl } from '../Mgr/UIMgr';
import { LevelConfig, ReelTableConfig, ReelUnitConfig, SymbolType } from '../InterFace/LevelConfig';
import { BaseReelTable } from './BaseReelTable';
import { BaseReelUnit } from "./BaseReelUnit";
import { BaseSymbolUnit } from "./BaseSymbolUnit";
import { LevelMgr } from '../Mgr/LevelMgr';

export enum RollStatus {
    Idle = 0, // -- 静止状态 
    Roll = 1 // -- 滚动状态
};

@ccclass('BaseMutilReelUnit')
export class BaseMutilReelUnit extends UICtrl {

    public m_levelConfig: LevelConfig = null;
    public m_reelUnitConfig: ReelUnitConfig = null;
    public m_reelTableConfig: ReelTableConfig = null;
    public m_reelUnitIndex: number = 0;
    public m_reelTableCompent: BaseReelTable = null;
    public m_reelTableIndex: number = 0;
    public m_viewCount: number = 0;
    public m_unitSize: Size = new Size(0, 0);
    public m_stopDoneNum: number = 0;
    public m_reelUnits: BaseReelUnit[] = [];
    public m_rollStatus: RollStatus = RollStatus.Idle;

    protected initView(): void {

    }

    start() {

    }

    update(deltaTime: number) {

    }

    public initUI(levelConfig: LevelConfig, reelUnitConfig: ReelUnitConfig, reelUnitIndex: number, reelTableCompent: BaseReelTable, reelTableIndex: number): void {
        this.m_levelConfig = levelConfig;
        this.m_reelUnitConfig = reelUnitConfig;
        this.m_reelUnitIndex = reelUnitIndex;
        this.m_reelTableCompent = reelTableCompent;
        this.m_reelTableIndex = reelTableIndex;
        this.m_reelTableConfig = reelTableCompent.m_reelTableConfig

        this.m_viewCount = this.m_reelUnitConfig.ViewCount;
        this.m_unitSize.width = this.m_reelUnitConfig.Width
        this.m_unitSize.height = this.m_reelUnitConfig.Height;
        this.m_stopDoneNum = 0;

        this.m_rollStatus = RollStatus.Idle;
        this.m_reelUnits = [];
    }

    // -- 初始化轮盘 (根据传入的轮盘数据显示)
    public async loadSymbolUnitUI(viewSymbolData: number[]): Promise<void> {
        assert(viewSymbolData != null, "viewSymbolData 不能为 null");
        assert(viewSymbolData.length == this.m_viewCount, "传入的轮盘数据显示数量与配置的ViewCount不匹配");

        let xPos = 0;
        let yPosStart = 0;
        for (let i = 0; i < this.m_viewCount; i++) {
            //  添加小滚轴 ( 1*1 的小滚轴 )
            let posY = yPosStart + this.m_unitSize.height * i;
            let maskNode = this.createRectMask(xPos, posY);
            // 绑定组件
            const compent: BaseReelUnit = maskNode.addComponent(BaseReelUnit) as BaseReelUnit;

            // 初始化组件参数
            const reelConfig = { ...this.m_reelUnitConfig }; // 等价于Lua的clone
            reelConfig.ViewCount = 1;
            compent.initUI(this.m_levelConfig, reelConfig, this.m_reelUnitIndex, this, this.m_reelTableIndex);
            compent.setViewRow(i);
            // 重置滚轴的数据 注意 这个代码必须在 loadSymbolUnitUI 之前
            this.resetRollData(compent);
            compent.loadSymbolUnitUI([viewSymbolData[i]]);

            // 如果是bonus信号块 设置为不可滚动
            let symbolConfig = LevelMgr.Instance.getSymbolConfig(viewSymbolData[i]);
            if (symbolConfig.type == SymbolType.BONUS) {
                compent.setAllowRoll(false);
                await this.waitNextFrame();
                // 初始化播放动画 针对bonus
                this.playLoadBonusAction(compent, viewSymbolData[i]);
            }

            // 存入compent指针
            this.m_reelUnits.push(compent);
        }
    }

    public getReelUnitCompent(row: number): BaseReelUnit {
        assert(this.m_reelUnits[row] != null, " !! 找到的控件为nil row = " + row + "!! ");
        return this.m_reelUnits[row];
    }

    // 当bonus信号块加载到轮盘的时候 播放的动画
    public playLoadBonusAction(compent: BaseReelUnit, symbolId: number): void {

    }

    // 重置滚轴的数据 子类重写
    public resetRollData(compent: BaseReelUnit): void {
        //compent.resetRollData();
        compent.resetRollData(this.m_reelTableConfig.RollData[this.m_reelUnitIndex])
    }

    public createRectMask(xPos: number, yPos: number): Node {
        // 1. 创建遮罩节点
        const maskNode = new Node('RectMask');
        this.node.addChild(maskNode);

        // 2. 添加并设置 UITransform（定义裁剪大小）
        const uiTransform = maskNode.addComponent(UITransform);
        uiTransform.setContentSize(this.m_unitSize.width, this.m_unitSize.height); //设置尺寸
        maskNode.setPosition(new Vec3(xPos, yPos, 0)); // 设置位置
        uiTransform.setAnchorPoint(0, 0); // 设置锚点

        // 3. 添加 Mask 组件并设置为矩形类型
        const mask = maskNode.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT; // 矩形遮罩
        // mask.inverted = true; // 可选：反转遮罩（显示外部，隐藏内部）

        return maskNode;
    }

    public startRoll(): void {
        for (let i = 0; i < this.m_viewCount; i++) {
            this.m_reelUnits[i].startRoll();
        }
    }
    // 停止滚动
    public stopRoll(viewSymbolData: number[], isQuickStop: boolean) {
        assert(viewSymbolData != null, "viewSymbolData 不能为 null");
        assert(viewSymbolData.length == this.m_viewCount, "传入的轮盘数据显示数量与配置的ViewCount不匹配 viewSymbolData.length = " + viewSymbolData.length + ", this.m_viewCount = " + this.m_viewCount);
        for (let i = 0; i < this.m_viewCount; i++) {
            this.m_reelUnits[i].stopRoll([viewSymbolData[i]], false); //不需要快停
        }
    }

    public setQuickSpeed(): void {

    }

    public oneReelUnitStopDone(): void {
        this.m_stopDoneNum = this.m_stopDoneNum + 1;
        if (this.m_stopDoneNum >= this.m_viewCount) {
            this.m_stopDoneNum = 0;
            // 当前所有小滚轴停止完毕
            this.m_reelTableCompent.oneReelUnitStopDone(this.m_reelUnitIndex);
        }
    }

    public playReelStopDoneSounds(): void {
        this.m_reelTableCompent.playReelStopDoneSounds();
    }

    // 获取行的世界坐标 索引 从0开始
    public getSymbolWorldPos(row: number): Vec3 {
        return this.m_reelUnits[row].getSymbolWorldPos(0);
    }

    public playSymbolAction(row: number, actionName: string, isLoop: boolean, isLineAction: boolean = false, callBack: Function | null = null): void {
        this.m_reelUnits[row].playSymbolAction(0, actionName, isLoop, isLineAction, callBack);
    }

    public showSymbolToFeature(col: number, row: number, symbolNode: Node): void {
        this.m_reelTableCompent.showSymbolToFeature(col, row, symbolNode);
    }

    // wild信号快的飞行动画
    public wildFlyAction(col: number, row: number): void {

    }

    // bonus信号快的飞行动画
    public bonusFlyAction(col: number, row: number): void {

    }
}


