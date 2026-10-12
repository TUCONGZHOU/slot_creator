import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';

@ccclass('LevelTR_UIBg_Ctrl')
export class LevelTR_UIBg_Ctrl extends UICtrl {

    protected initView(): void {
        GlEventMgr.Instance.on(EventName.ChangeBg, this.changeBg, this);
    }
    
    start() {
        this.changeBg( true );
    }

    update(deltaTime: number) {
        
    }

    public changeBg( isNormal:boolean ):void{
        if (isNormal){
            this.view["NormalBg"].active = true;
            this.view["FreeBg"].active = false;
        }
        else {
            this.view["NormalBg"].active = false;
            this.view["FreeBg"].active = true;
        }
    }
}


