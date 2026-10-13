import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { LevelJT_GameModel } from './LevelJT_GameModel';

@ccclass('LevelJT_FreeJackpot_Ctrl')
export class LevelJT_FreeJackpot_Ctrl extends UICtrl {
    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        this.initJackpotTitle()
    }
    
    public initUI( levelConfig:LevelConfig ):void{
        
    }

    public initJackpotTitle(){
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
        let Multiple = 0;
        for (let storedIcon of storedIcons[0]){
            if (storedIcon.id == 94){
                Multiple += storedIcon.Multiple || 0
            }
        }
        let bet = LevelMgr.Instance.getLevelModel().getBet();
        let str = Utils.util_formatCoins( bet * Multiple,9 );
        this.view['Grand/LabelGrand'].getComponent(Label).string = str;

        // this.view['Label'].getComponent(Label).string = str;
        this.resetJackpotTitle()
    }
    public resetJackpotTitle(){
        let bonusWinAmount = (LevelMgr.Instance.getLevelModel() as LevelJT_GameModel).getBonusWinAmount();
        let str = Utils.util_formatCoins( bonusWinAmount,9 );
        this.view['Label'].getComponent(Label).string = str;
    }
}


