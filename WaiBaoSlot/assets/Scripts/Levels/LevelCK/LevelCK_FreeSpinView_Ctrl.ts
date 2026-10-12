import { _decorator, Component, Node,Animation,Label } from 'cc';
import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { EventName } from '../../Mgr/EventName';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';

const { ccclass, property } = _decorator;

@ccclass('LevelCK_FreeSpinView_Ctrl')
export class LevelCK_FreeSpinView_Ctrl extends UICtrl {

    protected initView(): void {
        
    }

    start() {
        // 播放动画
        let animation = this.view["Node"].getComponent(Animation);
        animation.play("freeview");
    }

    public initUI(levelConfig:LevelConfig){
        let freeInfo = LevelMgr.Instance.getLevelModel().getFreeSpinInfo();
        let num1 = freeInfo.freeSpinsTotalCount;
        this.view["Node/lb_num"].getComponent(Label).string = num1;
    }

    update(deltaTime: number) {
        
    }
}


