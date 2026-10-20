import { _decorator, Component, Node,instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';

@ccclass('LevelJT_UIBg_Ctrl')
export class LevelJT_UIBg_Ctrl extends UICtrl {

    protected initView(): void {

    }

    start() {
        console.log("--------> 添加背景");
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action == ActionType.NORMAL){
            this.view['NormalBg'].active = true;
            this.view['FreeBg'].active = false;
            this.view['ReSpinBg'].active = false;
        }else if(action == ActionType.BONUS){
            
        }else if(action == ActionType.FREESPIN){
            this.view['NormalBg'].active = false;
            this.view['FreeBg'].active = true;
            this.view['ReSpinBg'].active = false;
        }else if(action == ActionType.RESPIN){
            this.view['NormalBg'].active = false;
            this.view['FreeBg'].active = false;
            this.view['ReSpinBg'].active = true;
        }
    }

    update(deltaTime: number) {
        
    }
}


