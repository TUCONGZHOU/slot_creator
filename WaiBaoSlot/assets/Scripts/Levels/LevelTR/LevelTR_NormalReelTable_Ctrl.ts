import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';

@ccclass('LevelTR_NormalReelTable_Ctrl')
export class LevelTR_NormalReelTable_Ctrl extends BaseReelTable {

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public addQuickEffect(col: number): void {

    }

    public removeQuickEffect(col: number): void {

    }

    // 重写基类
    public checkNeedQuickRoll(viewSymbolData: number[][], col: number): any {
        let hasCount = 0;
        for (let i = 0; i < col; i++) {
            if (this.hasScatterSymbol(viewSymbolData[i])) {
                hasCount = hasCount + 1;
            }
        }
        let result: any = {}
        result.needQuickRoll = false; // 是否需要快滚
        result.scatterCount = hasCount;

        // 播放Scatter音效
        if (hasCount == 2) {
            let soundFile = this.m_levelConfig.SoundsFile["Scatter"];
            SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
        }

        return result;
    }

    // 播放wild飞行动画
    public wildFlyAction(col: number, row: number) {
        this.m_gameTableCompent.wildFlyAction(col, row);
    }

    public playReelStopDoneSounds(): void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
    }

    // 重写基类
    public playLineAction(tableLine: any): void {
        if (tableLine.length == 0) {
            return;
        }

        // -- 先显示所有连线
        if (this.m_lineTween) {
            this.m_lineTween.stop();
            this.m_lineTween = null;
        }

        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            // 只播放一遍
            this.m_lineTween = tween(this.m_effectNode)
                .call(() => {
                    for (let lineData of tableLine) {
                        this.playLineAndEffectAction(lineData)
                    }
                })
                .delay(2)
                .call(() => {
                    // 清除特效层
                    this.clearEffect();
                })
                .start();
        } else {
            this.m_lineTween = tween(this.m_effectNode)
                .call(() => {
                    for (let lineData of tableLine) {
                        this.playLineAndEffectAction(lineData)
                    }
                })
                .delay(2)
                .call(() => {
                    // 清除特效层
                    this.clearEffect();
                })
                .union() // 把前面一串动画打包成一个整体
                .repeatForever()
                .start();
        }
    }

    // 重写基类
    public addPaoMaDengEffect(meta: any) {
        let id = meta.id;
        let col = meta.col;
        let row = meta.row;
        this.playSymbolLineAction(id, col, row);
    }
}


