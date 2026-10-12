import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelCK_FreeSpinOver2_Ctrl')
export class LevelCK_FreeSpinOver2_Ctrl extends UICtrl {
    start() {

    }

    protected initView(): void {
        
    }

    update(deltaTime: number) {
        
    }

    public initUI( callFunc:Function):void{
        Utils.performWithDelay(this.node,()=>{
            if(callFunc){
                callFunc();
            }
            // 关闭
            UIMgr.Instance.closeUi("LevelCK_FreeSpinOver2_Ctrl");
        },4)
    }
}


