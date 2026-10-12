import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { PlayerMgr } from '../../Mgr/PlayerMgr';
import { Utils } from '../../Util/Utils';

@ccclass('LevelCK_Jackpot_Ctrl')
export class LevelCK_Jackpot_Ctrl extends UICtrl {
    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {

    }

    public initUI( levelConfig:LevelConfig ):void{
        let jackpotList = PlayerMgr.Instance.getJackpots();
        this.view["lb_mini"].getComponent(Label).string = Utils.util_formatCoins( jackpotList[0],6 );
        this.view["lb_minor"].getComponent(Label).string = Utils.util_formatCoins( jackpotList[1],6 );
        this.view["lb_major"].getComponent(Label).string = Utils.util_formatCoins( jackpotList[2],6 );
        this.view["lb_grand"].getComponent(Label).string = Utils.util_formatCoins( jackpotList[3],6 );    
    }
}


