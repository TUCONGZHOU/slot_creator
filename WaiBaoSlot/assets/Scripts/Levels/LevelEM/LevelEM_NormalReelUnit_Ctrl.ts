import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelUnit } from '../../GameBase/BaseReelUnit';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelEM_NormalReelUnit_Ctrl')
export class LevelEM_NormalReelUnit_Ctrl extends BaseReelUnit {
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


