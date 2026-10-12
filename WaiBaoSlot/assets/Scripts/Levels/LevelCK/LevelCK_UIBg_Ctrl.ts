import { _decorator, Component, Node,instantiate, Vec3,view,UITransform } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { ResMgr } from '../../Mgr/ResMgr';

@ccclass('LevelCK_UIBg_Ctrl')
export class LevelCK_UIBg_Ctrl extends UICtrl {

    protected initView(): void {
        
    }
    
    start() {
        console.log("--------> 添加背景");
    }

    update(deltaTime: number) {
        
    }
}


