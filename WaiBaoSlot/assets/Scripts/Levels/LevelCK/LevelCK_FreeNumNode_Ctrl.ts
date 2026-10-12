import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';

@ccclass('LevelCK_FreeNumNode_Ctrl')
export class LevelCK_FreeNumNode_Ctrl extends UICtrl {

    protected initView(): void {

    }


    start() {

    }

    update(deltaTime: number) {
        
    }

    public initUI( levelConfig:LevelConfig ):void{
            
    }

    public setFreeNum( num:number ):void{
        this.view["lb_num"].getComponent(Label).string = num.toString();
    }
}


