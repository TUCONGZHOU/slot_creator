import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';

import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';

@ccclass('LevelCK_FreeReelTable_Ctrl')
export class LevelCK_FreeReelTable_Ctrl extends BaseReelTable {

    protected initView(): void {
        super.initView();
    }


    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public playReelStopDoneSounds():void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }
}


