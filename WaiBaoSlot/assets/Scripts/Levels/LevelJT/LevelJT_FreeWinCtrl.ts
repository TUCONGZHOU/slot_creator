import { _decorator, Component, Label, Node, Animation, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { LevelJT_GameModel } from './LevelJT_GameModel';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

let JACKPOTS:string[] = ["Grand/LabelGrand","Major/LabelMajor","Minor/LabelMinor","Mini/LabelMini"];

@ccclass('LevelJT_FreeWinCtrl')
export class LevelJT_FreeWinCtrl extends UICtrl {
    public m_levelConfig:LevelConfig = null;
    start() {
        
        
    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        
    }
    
    public initUI( levelConfig:LevelConfig ):void{
        this.m_levelConfig = levelConfig;
        let bonusWinAmount = (LevelMgr.Instance.getLevelModel() as LevelJT_GameModel).getBonusWinAmount();
        let str = Utils.util_formatCoins( bonusWinAmount,9 );
        this.view['LabelBonusCoins'].getComponent(Label).string = str;

        let winAmount = (LevelMgr.Instance.getLevelModel() as LevelJT_GameModel).getWinAmount();
        let allStr = Utils.util_formatCoins( bonusWinAmount + winAmount,18 );
        this.view['Label'].getComponent(Label).string = str;

        let winCount = LevelMgr.Instance.getLevelModel().getWinAmount();
        let soundFile = this.m_levelConfig.SoundsFile["Congrats"];
        if (soundFile && winCount > 0){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
    }
}


