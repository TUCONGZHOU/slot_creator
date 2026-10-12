import { _decorator, Component, Label, Node, Vec3,tween } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelCK_ReStartInfoNode_Ctrl')
export class LevelCK_ReStartInfoNode_Ctrl extends UICtrl {

    private m_levelConfig:LevelConfig = null;

    protected initView(): void {
        
    }

    start() {
        this.node.setScale( new Vec3(0.5,0.5,1) );
    }

    update(deltaTime: number) {
        
    }

    public initUI( levelConfig:LevelConfig ):void{
        
    }

    public startAction( levelConfig:LevelConfig ):void {
        this.m_levelConfig = levelConfig;
        const anims: Array<ReturnType<typeof tween>> = [];

        tween(this.node)
            .to(0.2, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .delay(1)
            .call(()=>{
                // 播放音效
                let soundFile = this.m_levelConfig.SoundsFile["ReSpinDoor"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
            })
            .to(0.2,{ scale: new Vec3(0, 0, 1) })
            .start();
    }

    
}


