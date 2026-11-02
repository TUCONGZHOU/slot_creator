import { _decorator, Component, Vec3, AnimationClip, Animation, assert, sp, UIOpacity, tween, Prefab, instantiate, Label } from 'cc';

import { UIMgr, UICtrl } from '../Mgr/UIMgr';
import { SymbolMgr } from '../Mgr/SymbolMgr';
import { BaseReelUnit } from './BaseReelUnit';
import { BaseReelTable } from './BaseReelTable';
import { BaseMutilReelUnit } from './BaseMutilReelUnit';
import { ResMgr } from "../Mgr/ResMgr";
import { LevelConfig, ReelTableConfig, ReelUnitConfig, SymbolConfig, SymbolRollData, SymbolViewType } from '../InterFace/LevelConfig';

const { ccclass, property } = _decorator;

// -- 调试开关：在图标上显示接口返回的 id，上线前改成 false 即可
const DEBUG_SHOW_SYMBOL_ID: boolean = true;
const DEBUG_ID_NODE_NAME: string = "DebugIdLabel";

@ccclass('BaseSymbolUnit')
export class BaseSymbolUnit extends UICtrl {

    protected initView(): void {

    }

    public m_data: any = null; // 信号块的缓存数据配置
    public m_meta: any = null; // 缓存中取的数据

    public m_reelUnitCompent: BaseReelUnit | null = null;
    public m_levelConfig: LevelConfig = null;
    public m_reelTableIndex: number = -1; // -- 轮盘的索引
    public m_reelUnitIndex: number = -1;  // -- 所在列的索引
    public m_reelTableCompent: BaseReelTable | BaseMutilReelUnit | null = null; // -- 所在轮盘的组件指针 (如果是滚轴组 就是滚轴组的指针)
    public m_viewRow: number = -1; // -- 此滚轴在轮盘上行的坐标 (滚轴组的标记)
    public m_config: SymbolConfig = null;
    public m_tweenOpacity: ReturnType<typeof tween> | null = null;

    start() {

    }

    update(deltaTime: number) {

    }

    /*
    --[[
        symbolData:信号块的缓存数据配置
        
        data = {
            id:信号块的id
            col:所在的列 -- 假滚的时候没有这个数据
            row:所在的行 -- 假滚的时候没有这个数据
            posType:有bottom view top 三种类型 -- 假滚的时候没有这个数据
            pos:标记大信号块 pos>1不渲染 表示空信号块 <此值可能也没有 比如创建用于显示的动画的时候>
        }

        reelUnitompent:滚轴组件的指针 可能没有 (外面可以创建单个的信号块)
    ]]
    */
    public initUI(data: SymbolRollData, reelUnitompent: BaseReelUnit | null): void {
        assert(data != null, " !! BaseSymbolUnit initUI data 不能为null !! ");
        this.clearState();

        this.m_data = data;

        if (reelUnitompent != null) {
            this.m_reelUnitCompent = reelUnitompent
            this.m_levelConfig = reelUnitompent.m_levelConfig
            this.m_reelTableIndex = reelUnitompent.m_reelTableIndex  //-- 轮盘的索引
            this.m_reelUnitIndex = reelUnitompent.m_reelUnitIndex     //-- 所在列的索引
            this.m_reelTableCompent = reelUnitompent.m_reelTableCompent   // -- 所在轮盘的组件指针 (如果是滚轴组 就是滚轴组的指针)
            this.m_viewRow = reelUnitompent.m_viewRow //-- 此滚轴在轮盘上行的坐标 (滚轴组的标记)
        }

        if (data.pos > 1) {
            // -- 不需要显示 也就不需要创建
        }
        else {
            let meta = SymbolMgr.Instance.getSymbolNodeById(data.id);
            this.m_meta = meta;
            this.m_config = meta.config as SymbolConfig;
            meta.node.parent = this.node;
            meta.node.active = true;
            meta.position = new Vec3(0, 0, 0);
            // 渐隐的组件
            this.resetOpacity();
            // 子类从写
            this.loadLogicDataUI(data);
            // -- 调试用：在图标上显示接口返回的 id
            this.showDebugSymbolId();
        }
    }

    // -- 调试用：图标预制体里摆好了名为 DebugIdLabel 的节点，这里只负责填接口返回的 id
    private showDebugSymbolId(): void {
        if (DEBUG_SHOW_SYMBOL_ID == false || this.m_meta == null || this.m_meta.node == null) {
            return;
        }
        const labelNode = this.m_meta.node.getChildByName(DEBUG_ID_NODE_NAME);
        if (labelNode == null) {
            return; // -- 该图标预制体没有配调试节点 直接跳过
        }
        const label = labelNode.getComponent(Label);
        if (label == null) {
            return;
        }
        label.string = String(this.m_data.id);
    }

    public resetOpacity(): void {
        // 渐隐的组件
        if (this.m_config.actype == "opacity") {
            this.stopOpacityLoop();
            let opacityIcon = this.m_meta.node.getChildByName("opacityIcon");
            const uiOpacity = opacityIcon.getComponent(UIOpacity);
            uiOpacity.opacity = 255;
        }
    }

    // -- 放入到feature
    public toFeatureShow(): void {
        if (this.m_data.posType == null) {
            return;
        }
        if (this.m_data.pos > 1 || this.m_data.posType != SymbolViewType.View) {
            return;
        }
        let row = this.m_data.row;
        if (this.m_viewRow != -1) {
            row = this.m_viewRow;
        }
        let toFeature: boolean = this.m_levelConfig.ToFeature[this.m_data.id.toString()];
        if (toFeature) {
            this.m_reelTableCompent.showSymbolToFeature(this.m_data.col, row, this.node);
        }
    }

    public playSymbolAction(actionName: string, isLoop: boolean, callBack: Function, isLineAction: boolean = false, timeScale: number = 1) {
        assert(actionName != null, " !! BaseSymbolUnit actionName is null !! ")
        this.playActionByName(actionName, isLoop, callBack, isLineAction, timeScale);
    }

    public playActionByName(actionName: string, isLoop: boolean, callBack: Function | null, isLineAction: boolean = false, timeScale: number = 1): void {
        if (this.m_meta == null || this.m_meta.node.active == false || this.m_config == null) {
            return;
        }
        if (this.m_data.posType == null || this.m_data.posType != SymbolViewType.View) {
            return;
        }
        if (this.m_data.pos > 1 || actionName == "") {
            return;
        }

        if (this.m_config.actype == "spine") {
            // -- 播放spine动画
            let spineNode = this.m_meta.node.getChildByName("skeleton");
            let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
            if (spine) {
                // 用这这个接口
                if (spine.findAnimation(actionName)) {
                    if (!isLoop) {
                        spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                            spine.setCompleteListener(null); // 清除监听器

                            if (!this.node || !this.node.isValid) return;

                            if (!spine || !spine.isValid)
                                return;

                            // // 切换到idle
                            // if (this.m_levelConfig && this.m_levelConfig.SymbolIdleAction){
                            //     let idleActionName = this.m_levelConfig.SymbolIdleAction[this.m_data.id.toString()];
                            //     if ( idleActionName != null && idleActionName != "" ){
                            //         if (idleActionName && spine.findAnimation(idleActionName)) {
                            //             console.log("--------------------> 切换idle");
                            //             spine.setAnimation(0, idleActionName, false);
                            //         }
                            //     }
                            // }

                            if (callBack) {
                                callBack();
                            }
                        });
                    }
                    // console.log(`-----> Spine 播放找到动画 animation: ${actionName} isLoop = ${isLoop} timeScale = ${timeScale}`);
                    spine.timeScale = timeScale;
                    spine.setAnimation(0, actionName, isLoop);
                } else {
                    console.warn(`-----> Spine 没有找到动画 animation not found: ${actionName}`);
                }
            }
            else {
                console.log("======> spine动画没有找到动画组件 spine symbolId = " + this.m_data.id);
            }
        }
        else if (this.m_config.actype == "normal") {
            let animation = this.m_meta.node.getComponent(Animation);
            if (animation) {
                animation.play(actionName);
                if (isLoop) {
                    animation.getState(actionName).wrapMode = AnimationClip.WrapMode.Loop; // 设置循环播放
                }

                // 监听动画结束事件 -- finished:动画播放完成时触发 stopped:动画停止时触发
                animation.once(Animation.EventType.FINISHED, () => {
                    // 执行回调
                    if (callBack) {
                        callBack();
                    }
                });
            }
            else {
                console.log("======> action动画没有找到动画组件 action symbolId = " + this.m_data.id);
            }
        }
        else if (this.m_config.actype == "opacity") {
            // 隐-显-隐
            let opacityIcon = this.m_meta.node.getChildByName("opacityIcon");
            const uiOpacity = opacityIcon.getComponent(UIOpacity)
            this.m_tweenOpacity = tween(uiOpacity)
                .delay(0.5)
                .to(0.05, { opacity: 0 })
                .delay(0.5)
                .to(0.05, { opacity: 255 })
            this.m_tweenOpacity.start();
        }
    }

    // -- 播放落地动画之类的 子类重写
    public playStopItAction(): void {
        if (this.m_levelConfig && this.m_levelConfig.SymbolStopAction) {
            let stopActionName = this.m_levelConfig.SymbolStopAction[this.m_data.id.toString()];
            if (stopActionName != null && stopActionName != "") {
                this.playActionByName(stopActionName, false, null);
            }
        }
    }

    // 静止帧
    public playIdleAction(): void {
        if (this.m_levelConfig && this.m_levelConfig.SymbolIdleAction) {
            let idleActionName = this.m_levelConfig.SymbolIdleAction[this.m_data.id.toString()];
            if (idleActionName != null && idleActionName != "") {
                this.playActionByName(idleActionName, false, null);
            }
        }
    }

    // -- 子类从写
    public loadLogicDataUI(data: SymbolRollData): void {

    }

    public getSymbolId(): number {
        return this.m_data.id;
    }

    public getMetaData(): any {
        return this.m_meta;
    }

    public getData(): any {
        return this.m_data;
    }

    public clearData(): void {
        this.m_data = null;
        this.m_meta = null;
    }

    public clearState(): void {
        // 切换到idle
        this.playIdleAction();
        this.stopOpacityLoop()
        this.clearData();
        this.m_config = null;
        this.m_reelUnitCompent = null;
    }

    // 停止动画
    public stopOpacityLoop(): void {
        if (this.m_tweenOpacity) {
            this.m_tweenOpacity.stop();
            this.m_tweenOpacity = null;
        }
    }

    // 组件失活时触发（removeFromParent 核心触发这个）
    onDisable() {
        this.clearState();
        super.onDisable();
    }

    // 组件销毁时触发（仅 destroy() 或自动回收时触发）
    onDestroy() {
        super.onDestroy();
    }
}


