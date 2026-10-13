import { _decorator, Component, Label, Node, Animation, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';

let JACKPOTS:string[] = ["Grand/LabelGrand","Major/LabelMajor","Minor/LabelMinor","Mini/LabelMini"];

@ccclass('LevelJT_ReSpinWinCtrl')
export class LevelJT_ReSpinWinCtrl extends UICtrl {
    start() {
        
        
    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons()
        this.view['Label'].getComponent(Label).string = storedIcons[0].length.toString()

        let Multiple = 0;
        for (let storedIcon of storedIcons[0]){
            if (storedIcon.id == 94 || storedIcon.id == 95 || storedIcon.id == 96){
                Multiple += storedIcon.Multiple || 0
            }
        }
        let bet = LevelMgr.Instance.getLevelModel().getBet();
        let str = Utils.util_formatCoins( bet * Multiple,18 );
        this.view['Label'].getComponent(Label).string = str;
    }
    
    public initUI( levelConfig:LevelConfig ):void{
        
    }

}


