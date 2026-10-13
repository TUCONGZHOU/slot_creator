import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';

@ccclass('LevelJT_ReSpinJackpot_Ctrl')
export class LevelJT_ReSpinJackpot_Ctrl extends UICtrl {
    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        this.resetJackpotTitle()
        this.resetGoldenCollectLb()
        this.resetGreenCollectLb()
    }
    
    public initUI( levelConfig:LevelConfig ):void{
        
    }

    public resetJackpotTitle(){
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons()
        this.view['Label'].getComponent(Label).string = storedIcons[0].length.toString()
    }
    public resetGoldenCollectLb(){
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
        let Multiple = 0;
        for (let storedIcon of storedIcons[0]){
            if (storedIcon.id == 94){
                Multiple += storedIcon.Multiple || 0
            }
        }
        let bet = LevelMgr.Instance.getLevelModel().getBet();
        let str = Utils.util_formatCoins( bet * Multiple,6 );
        this.view['Grand/LabelEachWins'].getComponent(Label).string = str;
    }
    public resetGreenCollectLb(){
        let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
        let Multiple = 0;
        for (let storedIcon of storedIcons[0]){
            if (storedIcon.id == 94 || storedIcon.id == 95){
                Multiple += storedIcon.Multiple || 0
            }
        }
        let bet = LevelMgr.Instance.getLevelModel().getBet();
        let str = Utils.util_formatCoins( bet * Multiple,6 );
        this.view['Grand-001/LabelNextWins'].getComponent(Label).string = str;
    }
}


