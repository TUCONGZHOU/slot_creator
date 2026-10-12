import { _decorator, Component, Node ,Label} from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../Mgr/UIMgr';
import { LevelMgr } from '../Mgr/LevelMgr';
import { Utils } from '../Util/Utils';
import { SoundMgr } from '../Mgr/SoundMgr';

@ccclass('BigWin_P_Ctrl')
export class BigWin_P_Ctrl extends UICtrl {

    protected initView(): void {

    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    public initUI():void {
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        let coin = Utils.util_formatCoins( winNum,6 );
        this.view["Node/lbWin"].getComponent(Label).string = coin;

        // 播放音效
        let soundFile = "Sounds/bigWin";
        if (soundFile){
            SoundMgr.Instance.playSound( "GameMain",soundFile );
        }

        let soundFile1 = "Sounds/bigwinner";
        if (soundFile1){
            SoundMgr.Instance.playSound( "GameMain",soundFile1 );
        }
    }
}


