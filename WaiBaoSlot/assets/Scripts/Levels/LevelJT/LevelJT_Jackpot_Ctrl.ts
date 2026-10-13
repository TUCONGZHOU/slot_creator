import { _decorator, Component, Label, Node, Animation, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';

let JACKPOTS:string[] = ["Grand/LabelGrand","Major/LabelMajor","Minor/LabelMinor","Mini/LabelMini"];

@ccclass('LevelJT_Jackpot_Ctrl')
export class LevelJT_Jackpot_Ctrl extends UICtrl {
    start() {
        let animation = this.node.getComponent(Animation);
        animation.play('normalJackpotTitle');
        animation.getState('normalJackpotTitle').wrapMode = AnimationClip.WrapMode.Loop; // 设置循环播放
        
    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        let jackpots = LevelMgr.Instance.getLevelModel().getJackpots()
        for (let index = 0;  index < jackpots.length; index++){
            if (this.view[JACKPOTS[index]]){
                let str = jackpots[index].toString()
                let coin = Utils.util_formatCoins( jackpots[index],6 );
                this.view[JACKPOTS[index]].getComponent(Label).string = coin
            }
        }
    }
    
    public initUI( levelConfig:LevelConfig ):void{
        
    }
}


