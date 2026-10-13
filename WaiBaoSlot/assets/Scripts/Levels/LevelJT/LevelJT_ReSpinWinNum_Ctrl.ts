import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';

@ccclass('LevelJT_ReSpinWinNum_Ctrl')
export class LevelJT_ReSpinWinNum_Ctrl extends UICtrl {

    public m_winNum = 0;
    protected initView(): void {
        
    }

    start() {
        this.view["lbWin"].getComponent(Label).string = "0";
    }

    update(deltaTime: number) {
        
    }

    public initUI( levelConfig:LevelConfig ):void{
            
    }

    public setWinNum( multiple:number ):void {
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        this.m_winNum = this.m_winNum + bet * multiple;
        let coin = Utils.util_formatCoins( this.m_winNum,3 );
        this.view["lbWin"].getComponent(Label).string = coin;
    }
}


