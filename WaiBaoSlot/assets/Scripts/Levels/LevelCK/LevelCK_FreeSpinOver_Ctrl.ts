import { _decorator, Component, Node,Label } from 'cc';
import { UICtrl } from '../../Mgr/UIMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

const { ccclass, property } = _decorator;

@ccclass('LevelCK_FreeSpinOver_Ctrl')
export class LevelCK_FreeSpinOver_Ctrl extends UICtrl {

    protected initView(): void {
        
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    public initUI():void{
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        let coin = Utils.util_formatCoins( winNum,6 );
        this.view["Node/lb_num"].getComponent(Label).string = coin;
    }
}


