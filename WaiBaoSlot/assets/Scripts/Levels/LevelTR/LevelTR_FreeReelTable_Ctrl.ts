import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';

@ccclass('LevelTR_FreeReelTable_Ctrl')
export class LevelTR_FreeReelTable_Ctrl extends BaseReelTable {

    protected initView(): void {
        super.initView();
    }


    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public playReelStopDoneSounds(): void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
    }

    // 播放wild飞行动画
    public wildFlyAction(col: number, row: number) {
        this.m_gameTableCompent.wildFlyAction(col, row);
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

    // 重写基类
    public addPaoMaDengEffect(meta: any) {
        let id = meta.id;
        let col = meta.col;
        let row = meta.row;
        this.playSymbolLineAction(id, col, row);
    }
}


