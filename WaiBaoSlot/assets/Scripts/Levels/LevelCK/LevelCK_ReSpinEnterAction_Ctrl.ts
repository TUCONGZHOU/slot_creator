import { _decorator, Component, Node,Animation, utils } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { SoundMgr } from '../../Mgr/SoundMgr';

import { Utils } from '../../Util/Utils';

@ccclass('LevelCK_ReSpinEnterAction_Ctrl')
export class LevelCK_ReSpinEnterAction_Ctrl extends UICtrl {

    m_levelConfig:LevelConfig = null;
    protected initView(): void {
        
    }

    start() {
        
    }

    public initUI(levelConfig:LevelConfig):void{
        this.m_levelConfig = levelConfig
        // 播放动画
        let animation = this.node.getComponent(Animation);
        animation.play("respin_enter");

        // -- 音效 用freespin的音效
        let soundFile = this.m_levelConfig.SoundsFile["ReSpinDoor"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }

        Utils.performWithDelay( this.node,()=>{
            let soundFile = this.m_levelConfig.SoundsFile["ReSpinDoor"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }
        },1.5)
    }

    update(deltaTime: number) {
        
    }
}


